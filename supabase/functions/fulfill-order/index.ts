// Fulfill a paid order via DataHub Ghana API
// https://app.datahubgh.com/api/external/data-purchase
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATAHUB_URL = "https://app.datahubgh.com/api/external/data-purchase";

const PROVIDER_NETWORK_MAP: Record<string, string> = {
  MTN: "YELLO",
  Telecel: "TELECEL",
  AirtelTigo: "AT_PREMIUM",
  AT: "AT_PREMIUM",
};

// Map DataHub status → internal order_status
function mapStatus(s: string): { order_status: string; payment_status?: string } {
  const up = (s || "").toUpperCase();
  if (up === "SUCCESSFUL") return { order_status: "completed" };
  if (up === "FAILED" || up === "CANCELLED") return { order_status: "failed" };
  return { order_status: "processing" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const apiKey = Deno.env.get("DATAHUB_API_KEY");
    if (!apiKey) throw new Error("DATAHUB_API_KEY not configured");

    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId is required");

    // Load order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (orderErr || !order) throw new Error(`Order not found: ${orderErr?.message}`);

    // Guard: must be paid, not already completed, not yet sent to provider
    if (order.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ success: false, error: "Order not paid yet" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (order.order_status === "completed" || order.external_reference) {
      return new Response(
        JSON.stringify({ success: true, message: "Already fulfilled", reference: order.external_reference }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve bundle provider config
    let networkKey: string | null = null;
    let capacity: string | null = null;
    if (order.bundle_id) {
      const { data: bundle } = await supabase
        .from("data_bundles")
        .select("provider_network_key, provider_capacity, provider, data_amount")
        .eq("id", order.bundle_id)
        .maybeSingle();
      if (bundle) {
        networkKey = bundle.provider_network_key || PROVIDER_NETWORK_MAP[bundle.provider] || null;
        capacity = bundle.provider_capacity || (bundle.data_amount?.match(/(\d+(?:\.\d+)?)/)?.[1] ?? null);
      }
    }

    if (!networkKey || !capacity) {
      await supabase.from("orders").update({
        provider_status: "config_missing",
      }).eq("id", orderId);
      throw new Error("Bundle is missing provider_network_key or provider_capacity. Configure it in Admin → Bundles.");
    }

    // Validate recipient
    const recipient = (order.recipient_phone || "").trim();
    if (!/^0\d{9}$/.test(recipient)) {
      throw new Error("Invalid recipient phone — must be 10 digits starting with 0");
    }

    console.log("Dispatching to DataHub:", { orderId, networkKey, capacity, recipient });

    const dhRes = await fetch(DATAHUB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({ networkKey, recipient, capacity }),
    });
    const dhBody = await dhRes.json().catch(() => ({}));
    console.log("DataHub response:", dhRes.status, dhBody);

    if (!dhRes.ok || !dhBody?.success) {
      const errMsg = dhBody?.error || `DataHub HTTP ${dhRes.status}`;
      await supabase.from("orders").update({
        provider_status: `error: ${errMsg}`.slice(0, 250),
      }).eq("id", orderId);
      // Audit
      await supabase.from("audit_logs").insert({
        user_id: order.user_id,
        action: "fulfillment_failed",
        entity: "orders",
        entity_id: orderId,
        metadata: { provider: "datahub", error: errMsg, request: { networkKey, capacity, recipient } },
      });
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reference = dhBody.data?.reference || dhBody.data?.orderNumber?.toString() || null;
    const providerStatus = dhBody.data?.status || "PROCESSING";
    const mapped = mapStatus(providerStatus);

    await supabase.from("orders").update({
      external_reference: reference,
      provider_status: providerStatus,
      order_status: mapped.order_status,
    }).eq("id", orderId);

    await supabase.from("audit_logs").insert({
      user_id: order.user_id,
      action: "fulfillment_dispatched",
      entity: "orders",
      entity_id: orderId,
      metadata: { provider: "datahub", reference, providerStatus },
    });

    return new Response(
      JSON.stringify({ success: true, reference, status: providerStatus }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("fulfill-order error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
