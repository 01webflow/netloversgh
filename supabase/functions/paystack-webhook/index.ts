import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

// Verify Paystack webhook signature using Web Crypto API
async function verifyWebhookSignature(body: string, signature: string, secretKey: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = encoder.encode(secretKey);
    const message = encoder.encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSignature === signature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      console.error("Paystack secret key not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // Verify webhook signature
    const isValidSignature = await verifyWebhookSignature(body, signature, paystackSecretKey);
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event = JSON.parse(body);
    console.log("Received Paystack webhook event:", event.event);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Handle different event types
    switch (event.event) {
      case "charge.success": {
        const { reference, amount, metadata, customer } = event.data;
        const amountInCedis = amount / 100;

        console.log("Processing successful charge:", { reference, amount: amountInCedis, metadata });

        if (metadata?.type === "wallet_topup" && metadata?.userId) {
          // Credit wallet for top-up
          const { data: profile, error: fetchError } = await supabase
            .from("profiles")
            .select("wallet_balance")
            .eq("user_id", metadata.userId)
            .single();

          if (fetchError) {
            console.error("Error fetching profile:", fetchError);
            break;
          }

          const newBalance = (profile?.wallet_balance || 0) + amountInCedis;

          const { error: updateError } = await supabase
            .from("profiles")
            .update({ wallet_balance: newBalance })
            .eq("user_id", metadata.userId);

          if (updateError) {
            console.error("Error updating wallet:", updateError);
            break;
          }

          // Create transaction record
          await supabase.from("transactions").insert({
            user_id: metadata.userId,
            type: "credit",
            amount: amountInCedis,
            description: "Wallet top-up via Paystack (webhook)",
            reference: reference,
            status: "completed",
          });

          // Send notification
          try {
            await supabase.functions.invoke("send-notification", {
              body: {
                userId: metadata.userId,
                type: "wallet_credit",
                data: {
                  amount: amountInCedis,
                  newBalance: newBalance,
                },
              },
            });
          } catch (notifError) {
            console.error("Failed to send notification:", notifError);
          }

          console.log("Wallet credited successfully via webhook:", { 
            userId: metadata.userId, 
            amount: amountInCedis, 
            newBalance 
          });

        } else if (metadata?.type === "order_payment" && metadata?.orderId) {
          // Update order status
          const { data: order, error: orderFetchError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", metadata.orderId)
            .single();

          if (orderFetchError) {
            console.error("Error fetching order:", orderFetchError);
            break;
          }

          // Only update if not already paid
          if (order.payment_status !== "paid") {
            const { error: orderError } = await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                order_status: "processing",
              })
              .eq("id", metadata.orderId);

            if (orderError) {
              console.error("Error updating order:", orderError);
              break;
            }

            // Send order confirmation notification
            try {
              await supabase.functions.invoke("send-notification", {
                body: {
                  userId: metadata.userId,
                  type: "order_confirmed",
                  data: {
                    orderId: metadata.orderId,
                    packageName: order.package_name,
                    amount: amountInCedis,
                    phone: order.recipient_phone,
                  },
                },
              });
            } catch (notifError) {
              console.error("Failed to send order notification:", notifError);
            }

            console.log("Order payment processed via webhook:", {
              orderId: metadata.orderId,
              amount: amountInCedis
            });

            // Trigger DataHub fulfillment
            try {
              await supabase.functions.invoke("fulfill-order", {
                body: { orderId: metadata.orderId },
              });
            } catch (fErr) {
              console.error("fulfill-order invocation failed:", fErr);
            }
          }
        }
        break;
      }

      case "charge.failed": {
        const { reference, metadata } = event.data;
        console.log("Payment failed:", { reference, metadata });

        if (metadata?.type === "order_payment" && metadata?.orderId) {
          // Update order to failed
          await supabase
            .from("orders")
            .update({
              payment_status: "failed",
              order_status: "failed",
            })
            .eq("id", metadata.orderId);

          // Send failure notification
          try {
            await supabase.functions.invoke("send-notification", {
              body: {
                userId: metadata.userId,
                type: "payment_failed",
                data: {
                  orderId: metadata.orderId,
                  reference: reference,
                },
              },
            });
          } catch (notifError) {
            console.error("Failed to send failure notification:", notifError);
          }
        }
        break;
      }

      case "transfer.success": {
        // Handle successful transfers (e.g., agent payouts)
        console.log("Transfer successful:", event.data);
        break;
      }

      case "transfer.failed": {
        // Handle failed transfers
        console.log("Transfer failed:", event.data);
        break;
      }

      default:
        console.log("Unhandled event type:", event.event);
    }

    // Always return 200 to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Webhook processing error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
