import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackInitRequest {
  amount: number;
  email: string;
  userId: string;
  type: "wallet_topup" | "order_payment";
  orderId?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const { amount, email, userId, type, orderId, metadata } = await req.json() as PaystackInitRequest;

    console.log("Initializing Paystack payment:", { amount, email, type, orderId });

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
          userId,
          type,
          orderId,
          ...metadata,
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
