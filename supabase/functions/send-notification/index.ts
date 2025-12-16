import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "order_confirmation" | "low_wallet_balance" | "order_status_update";
  user_id: string;
  data: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { type, user_id, data }: NotificationRequest = await req.json();

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user?.email) {
      console.error("Failed to get user email:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = userData.user.email;
    let subject = "";
    let htmlContent = "";

    switch (type) {
      case "order_confirmation":
        subject = "Order Confirmed - NetLoversGH";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">NetLoversGH</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Order Confirmed! 🎉</h2>
              <p style="color: #4b5563;">Your data bundle order has been confirmed and is being processed.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Package:</strong> ${data.package_name || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Data:</strong> ${data.data_amount || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Price:</strong> GHS ${data.price || "0.00"}</p>
                <p style="margin: 5px 0;"><strong>Recipient:</strong> ${data.recipient_phone || "N/A"}</p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Your data will be delivered shortly. Thank you for choosing NetLoversGH!
              </p>
            </div>
          </div>
        `;
        break;

      case "low_wallet_balance":
        subject = "Low Wallet Balance Alert - NetLoversGH";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">NetLoversGH</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Low Balance Alert ⚠️</h2>
              <p style="color: #4b5563;">Your wallet balance is running low.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 10px 0;">Current Balance</p>
                <p style="font-size: 32px; font-weight: bold; color: #ef4444; margin: 0;">
                  GHS ${data.balance || "0.00"}
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">
                Top up your wallet to continue enjoying instant data purchases!
              </p>
              
              <a href="${data.topup_url || '#'}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">
                Top Up Now
              </a>
            </div>
          </div>
        `;
        break;

      case "order_status_update":
        const statusColors: Record<string, string> = {
          completed: "#10b981",
          processing: "#f59e0b",
          failed: "#ef4444",
        };
        const statusColor = statusColors[data.status as string] || "#6b7280";
        
        subject = `Order ${data.status} - NetLoversGH`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">NetLoversGH</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
              <h2 style="color: #1f2937; margin-top: 0;">Order Status Update</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #6b7280; margin: 0 0 10px 0;">Status</p>
                <p style="font-size: 24px; font-weight: bold; color: ${statusColor}; margin: 0; text-transform: capitalize;">
                  ${data.status || "Unknown"}
                </p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <p style="margin: 5px 0;"><strong>Package:</strong> ${data.package_name || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Recipient:</strong> ${data.recipient_phone || "N/A"}</p>
              </div>
            </div>
          </div>
        `;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }

    const emailResponse = await resend.emails.send({
      from: "NetLoversGH <notifications@resend.dev>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-notification function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
