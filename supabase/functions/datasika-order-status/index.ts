// Poll Datasika for the delivery status of an order and sync it locally.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAuthenticatedUser, isAdmin, isServiceRole, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATASIKA_BASE = "https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1";

function mapStatus(s: string): string {
  const v = (s || "").toLowerCase();
  if (v === "delivered" || v === "completed") return "completed";
  if (v === "failed" || v === "refunded" || v === "cancelled") return "failed";
  return "processing";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("DATASIKA_API_KEY");
    if (!apiKey) throw new Error("DATASIKA_API_KEY not configured");

    const { orderId } = await req.json();
    if (!orderId) throw new Error("orderId is required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, external_reference, order_status")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) throw new Error("Order not found");

    // Only the owner, an admin, or a server-to-server caller may poll
    if (!isServiceRole(req)) {
      const user = await getAuthenticatedUser(req);
      if (!user) return unauthorized(corsHeaders);
      if (user.id !== order.user_id && !(await isAdmin(user.id))) return unauthorized(corsHeaders);
    }

    if (!order.external_reference) {
      return new Response(JSON.stringify({ success: true, status: order.order_status, pending_dispatch: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch(
      `${DATASIKA_BASE}/api-order-status?order_id=${encodeURIComponent(order.external_reference)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Datasika status error", res.status, body);
      return new Response(JSON.stringify({ success: false, status: res.status, details: body }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const providerStatus = (body.status as string) || "pending";
    const mapped = mapStatus(providerStatus);

    if (order.order_status !== "completed" && order.order_status !== "failed") {
      await supabase
        .from("orders")
        .update({ provider_status: providerStatus, order_status: mapped })
        .eq("id", order.id);
    }

    return new Response(JSON.stringify({ success: true, status: mapped, provider_status: providerStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("datasika-order-status error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
