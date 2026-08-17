import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAuthenticatedUser, isServiceRole, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    // Require a signed-in caller (or an internal service-role call)
    const serviceCall = isServiceRole(req);
    const caller = serviceCall ? null : await getAuthenticatedUser(req);
    if (!serviceCall && !caller) return unauthorized(corsHeaders);

    const { reference } = await req.json();
    if (typeof reference !== "string" || reference.length < 4 || reference.length > 128) {
      return new Response(JSON.stringify({ error: "Invalid reference" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("Verifying payment reference:", reference);

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data?.status !== "success") {
      return new Response(JSON.stringify({
        success: false,
        message: "Payment not successful",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, type, orderId } = data.data.metadata ?? {};
    const amountPaid = data.data.amount / 100; // Convert from pesewas to cedis

    // A signed-in caller may only settle their own transaction
    if (caller && userId && userId !== caller.id) {
      return unauthorized(corsHeaders);
    }

    // Idempotency: skip if this reference was already credited
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id")
      .eq("reference", reference)
      .maybeSingle();

    if (existingTx) {
      return new Response(JSON.stringify({ success: true, amount: amountPaid, type, alreadyProcessed: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    if (type === "wallet_topup") {
      // Credit the user's wallet
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", userId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = (profile?.wallet_balance || 0) + amountPaid;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Create transaction record
      await supabase.from("transactions").insert({
        user_id: userId,
        type: "credit",
        amount: amountPaid,
        description: `Wallet top-up via Paystack`,
        reference: reference,
        status: "completed",
      });

      console.log("Wallet credited successfully:", { userId, amount: amountPaid, newBalance });
    } else if (type === "order_payment" && orderId) {
      // Update order payment status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          order_status: "processing",
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      console.log("Order payment processed:", { orderId, amount: amountPaid });

      // Trigger DataHub fulfillment (best-effort)
      try {
        await supabase.functions.invoke("fulfill-order", { body: { orderId } });
      } catch (fErr) {
        console.error("fulfill-order invocation failed:", fErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      amount: amountPaid,
      type,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
