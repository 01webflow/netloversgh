import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAuthenticatedUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackInitRequest {
  amount: number;
  email?: string;
  userId?: string;
  type: "wallet_topup" | "order_payment";
  orderId?: string;
  metadata?: Record<string, unknown>;
}

const MIN_AMOUNT = 1;
const MAX_TOPUP = 10000;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Require a signed-in caller; never trust client-supplied identity
    const caller = await getAuthenticatedUser(req);
    if (!caller) return unauthorized(corsHeaders);

    const body = await req.json() as PaystackInitRequest;
    const { type, orderId, metadata } = body;

    if (type !== "wallet_topup" && type !== "order_payment") {
      return new Response(JSON.stringify({ error: "Invalid payment type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = caller.id;
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Server-side amount resolution
    let amount: number;
    if (type === "order_payment") {
      if (!orderId) {
        return new Response(JSON.stringify({ error: "orderId is required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: order, error: orderErr } = await admin
        .from("orders")
        .select("id, user_id, price, payment_status")
        .eq("id", orderId)
        .maybeSingle();

      if (orderErr || !order || order.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (order.payment_status === "paid") {
        return new Response(JSON.stringify({ error: "Order already paid" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      amount = Number(order.price);
    } else {
      amount = Number(body.amount);
      if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_TOPUP) {
        return new Response(JSON.stringify({ error: `Amount must be between ${MIN_AMOUNT} and ${MAX_TOPUP}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      amount = Math.round(amount * 100) / 100;
    }

    const email = caller.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "Account has no email address" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Initializing Paystack payment:", { amount, type, orderId, userId });

    // Amount should be in kobo (pesewas for GHS)
    const amountInPesewas = Math.round(amount * 100);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountInPesewas,
        currency: "GHS",
        callback_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/paystack-webhook`,
        metadata: {
          ...(metadata ?? {}),
          userId,
          type,
          orderId,
        },
      }),
    });


    const data = await response.json();
    console.log("Paystack response:", data);

    if (!data.status) {
      throw new Error(data.message || "Failed to initialize payment");
    }

    return new Response(JSON.stringify({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error initializing payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
