// Fulfill a paid order via the Datasika Developer API
// https://datasika.com/developers/docs
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATASIKA_BASE = "https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1";

// Map Datasika status → internal order_status
function mapStatus(s: string): string {
  const v = (s || "").toLowerCase();
  if (v === "delivered" || v === "completed") return "completed";
  if (v === "failed" || v === "refunded" || v === "cancelled") return "failed";
  return "processing";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const apiKey = Deno.env.get("DATASIKA_API_KEY");
    if (!apiKey) throw new Error("DATASIKA_API_KEY not configured");

    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId is required");

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error(`Order not found: ${orderErr?.message}`);

    if (order.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, error: "Order not paid yet" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.order_status === "completed" || order.external_reference) {
      return new Response(
        JSON.stringify({ success: true, message: "Already fulfilled", reference: order.external_reference }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve supplier product
    let productId: string | null = null;
    if (order.bundle_id) {
      const { data: bundle } = await supabase
        .from("data_bundles")
        .select("provider_product_id")
        .eq("id", order.bundle_id)
        .maybeSingle();
      productId = bundle?.provider_product_id ?? null;
    }

    if (!productId) {
      await supabase.from("orders").update({ provider_status: "config_missing" }).eq("id", orderId);
      throw new Error("Bundle has no supplier product mapping. Sync the catalog in Admin → Bundles.");
    }

    const recipient = (order.recipient_phone || "").trim();
    if (!/^0\d{9}$/.test(recipient)) {
      throw new Error("Invalid recipient phone — must be 10 digits starting with 0");
    }

    console.log("Dispatching to Datasika:", { orderId, productId, recipient });

    const res = await fetch(`${DATASIKA_BASE}/api-buy-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Idempotency-Key": `order-${orderId}`,
      },
      body: JSON.stringify({ product_id: productId, recipient }),
    });
    const body = await res.json().catch(() => ({}));
    console.log("Datasika response:", res.status, body);

    if (!res.ok || !body?.order_id) {
      const errMsg = body?.code || body?.error || body?.message || `Datasika HTTP ${res.status}`;
      await supabase
        .from("orders")
        .update({ provider_status: `error: ${errMsg}`.slice(0, 250) })
        .eq("id", orderId);
      await supabase.from("audit_logs").insert({
        user_id: order.user_id,
        action: "fulfillment_failed",
        entity: "orders",
        entity_id: orderId,
        metadata: { provider: "datasika", error: errMsg, request: { productId, recipient } },
      });
      return new Response(JSON.stringify({ success: false, error: errMsg, status: res.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reference = body.order_id as string;
    const providerStatus = (body.status as string) || "pending";

    await supabase
      .from("orders")
      .update({
        external_reference: reference,
        provider_status: providerStatus,
        order_status: mapStatus(providerStatus),
      })
      .eq("id", orderId);

    await supabase.from("audit_logs").insert({
      user_id: order.user_id,
      action: "fulfillment_dispatched",
      entity: "orders",
      entity_id: orderId,
      metadata: { provider: "datasika", reference, providerStatus, amount_charged: body.amount_charged },
    });

    return new Response(JSON.stringify({ success: true, reference, status: providerStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("fulfill-order error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
