// DataHub Ghana webhook receiver — updates order status from real-time events
// Configure URL at: https://app.datahubgh.com/user/api-keys
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-webhook-event, x-webhook-timestamp, user-agent",
};

function mapStatus(s: string) {
  const up = (s || "").toUpperCase();
  if (up === "SUCCESSFUL") return "completed";
  if (up === "FAILED" || up === "CANCELLED") return "failed";
  return "processing";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ua = req.headers.get("user-agent") || "";
    if (!ua.includes("DatahubGH")) {
      console.warn("Unexpected User-Agent on datahub-webhook:", ua);
    }

    const event = await req.json();
    console.log("DataHub webhook:", event?.event, event?.data?.reference);

    if (event?.event !== "order.status_updated" || !event?.data) {
      return new Response(JSON.stringify({ received: true, ignored: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reference, status, orderNumber } = event.data;
    const ref = reference || (orderNumber ? String(orderNumber) : null);
    if (!ref) {
      return new Response(JSON.stringify({ received: true, error: "no reference" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = mapStatus(status);

    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, package_name, order_status")
      .eq("external_reference", ref)
      .maybeSingle();

    if (!order) {
      console.warn("No matching order for reference:", ref);
      return new Response(JSON.stringify({ received: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: skip if already completed/failed
    if (order.order_status === "completed" || order.order_status === "failed") {
      return new Response(JSON.stringify({ received: true, idempotent: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("orders").update({
      order_status: newStatus,
      provider_status: status,
    }).eq("id", order.id);

    // Notify user
    if (newStatus === "completed" || newStatus === "failed") {
      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            userId: order.user_id,
            type: newStatus === "completed" ? "order_delivered" : "order_failed",
            data: { orderId: order.id, packageName: order.package_name, reference: ref },
          },
        });
      } catch (e) {
        console.error("notification failed:", e);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("datahub-webhook error:", message);
    // Still return 200 to avoid retries on parse errors? Use 500 to allow DataHub retry.
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
