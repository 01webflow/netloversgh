// Sync the Datasika catalog into data_bundles with a 10.5% profit margin.
// Admin-only.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { getAuthenticatedUser, isAdmin, isServiceRole, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DATASIKA_BASE = "https://nrsfvhztpzwkadwciizp.supabase.co/functions/v1";
const MARGIN = 0.105; // selling price = cost / (1 - margin)

const NETWORK_TO_PROVIDER: Record<string, string> = {
  MTN: "MTN",
  Telecel: "Telecel",
  AirtelTigo: "AT",
  AT: "AT",
};

function sellingPrice(cost: number): number {
  return Math.round((cost / (1 - MARGIN)) * 100) / 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!isServiceRole(req)) {
      const user = await getAuthenticatedUser(req);
      if (!user || !(await isAdmin(user.id))) return unauthorized(corsHeaders);
    }

    const apiKey = Deno.env.get("DATASIKA_API_KEY");
    if (!apiKey) throw new Error("DATASIKA_API_KEY not configured");

    const res = await fetch(`${DATASIKA_BASE}/api-catalog`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Datasika catalog error", res.status, body);
      return new Response(JSON.stringify({ success: false, status: res.status, details: body }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const items = body?.services?.data_bundles?.items ?? [];
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const seen: string[] = [];
    let created = 0;
    let updated = 0;

    for (const item of items) {
      const provider = NETWORK_TO_PROVIDER[item.network] ?? item.network;
      const cost = Number(item.price);
      const price = sellingPrice(cost);
      seen.push(item.product_id);

      const { data: existing } = await supabase
        .from("data_bundles")
        .select("id")
        .eq("provider_product_id", item.product_id)
        .maybeSingle();

      const row = {
        provider,
        name: `${item.network} ${item.bundle_gb}GB`,
        data_amount: `${item.bundle_gb} GB`,
        price,
        cost_price: cost,
        provider_product_id: item.product_id,
        provider_source: "datasika",
        provider_network_key: item.network,
        provider_capacity: String(item.bundle_gb),
        delivery_type: "instant",
        is_active: true,
      };

      if (existing) {
        await supabase.from("data_bundles").update(row).eq("id", existing.id);
        updated++;
      } else {
        await supabase.from("data_bundles").insert(row);
        created++;
      }
    }

    // Retire Datasika bundles that disappeared from the catalog
    let retired = 0;
    if (seen.length) {
      const { data: stale } = await supabase
        .from("data_bundles")
        .select("id")
        .eq("provider_source", "datasika")
        .eq("is_active", true)
        .not("provider_product_id", "in", `(${seen.join(",")})`);
      if (stale?.length) {
        await supabase
          .from("data_bundles")
          .update({ is_active: false })
          .in("id", stale.map((s) => s.id));
        retired = stale.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, created, updated, retired, total: items.length, margin: MARGIN }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("datasika-sync-catalog error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
