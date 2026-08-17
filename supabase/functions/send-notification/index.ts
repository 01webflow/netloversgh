import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { getAuthenticatedUser, isAdmin, isServiceRole, unauthorized } from "../_shared/auth.ts";


const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// WhatsApp Business API credentials (Meta Cloud API)
const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "order_confirmation" | "low_wallet_balance" | "order_status_update" | "refund_processed" | "agent_approved" | "agent_rejected";
  user_id: string;
  data: Record<string, unknown>;
  channel?: "email" | "whatsapp" | "both";
}

// Send WhatsApp message using Meta Cloud API
async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  if (!whatsappToken || !whatsappPhoneId) {
    console.log("WhatsApp credentials not configured, skipping WhatsApp notification");
    return false;
  }

  try {
    // Format phone number for WhatsApp (remove leading 0, add country code)
    let formattedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "233" + formattedPhone.substring(1); // Ghana country code
    } else if (!formattedPhone.startsWith("233")) {
      formattedPhone = "233" + formattedPhone;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: formattedPhone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error("WhatsApp API error:", result);
      return false;
    }

    console.log("WhatsApp message sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    return false;
  }
}

// Generate plain text message for WhatsApp
function generateWhatsAppMessage(type: string, data: Record<string, unknown>): string {
  switch (type) {
    case "order_confirmation":
      return `🎉 *Order Confirmed - NetLoversGH*

Your data bundle order has been confirmed!

📦 *Package:* ${data.package_name || "N/A"}
📊 *Data:* ${data.data_amount || "N/A"}
💰 *Price:* GHS ${data.price || "0.00"}
📱 *Recipient:* ${data.recipient_phone || "N/A"}

Your data will be delivered shortly. Thank you for choosing NetLoversGH!`;

    case "low_wallet_balance":
      return `⚠️ *Low Balance Alert - NetLoversGH*

Your wallet balance is running low.

💰 *Current Balance:* GHS ${data.balance || "0.00"}

Top up your wallet to continue enjoying instant data purchases!`;

    case "order_status_update":
      const statusEmoji: Record<string, string> = {
        completed: "✅",
        processing: "⏳",
        failed: "❌",
      };
      const status = String(data.status || "");
      const emoji = statusEmoji[status] || "📋";
      
      return `${emoji} *Order ${status.toUpperCase()} - NetLoversGH*

📦 *Package:* ${data.package_name || "N/A"}
📱 *Recipient:* ${data.recipient_phone || "N/A"}
📋 *Status:* ${status.toUpperCase()}`;

    case "refund_processed":
      return `💸 *Refund Processed - NetLoversGH*

Your refund has been processed successfully!

📦 *Package:* ${data.package_name || "N/A"}
💰 *Refund Amount:* GHS ${data.refund_amount || "0.00"}

The amount has been credited to your wallet. Thank you for your patience!`;

    case "agent_approved":
      return `🎉 *Welcome Agent - NetLoversGH*

Congratulations! Your agent application has been approved!

🏪 *Business:* ${data.business_name || "N/A"}
📱 *Referral Code:* ${data.referral_code || "N/A"}

You can now start earning commissions on sales. Visit your dashboard to get started!`;

    case "agent_rejected":
      return `😔 *Application Update - NetLoversGH*

We're sorry, but your agent application was not approved at this time.

Please contact support if you have questions or would like to reapply.`;

    default:
      return "Notification from NetLoversGH";
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // AuthZ: backend (service role), admins, or the user themselves
    const serviceCall = isServiceRole(req);
    let caller: { id: string; email: string | null } | null = null;
    if (!serviceCall) {
      caller = await getAuthenticatedUser(req);
      if (!caller) return unauthorized(corsHeaders);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: NotificationRequest = await req.json();
    const { type, data, channel = "email" } = body;
    let { user_id } = body;

    if (!serviceCall && caller) {
      const callerIsAdmin = await isAdmin(caller.id);
      if (!callerIsAdmin) user_id = caller.id;
    }

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }


    // Get user info
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    
    if (userError || !userData?.user) {
      console.error("Failed to get user:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userEmail = userData.user.email;
    
    // Get user profile for phone number (for WhatsApp)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("phone")
      .eq("user_id", user_id)
      .single();

    const userPhone = profileData?.phone || (data.recipient_phone as string);

    let emailSent = false;
    let whatsappSent = false;

    // Send email if channel is email or both
    if ((channel === "email" || channel === "both") && userEmail) {
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
          break;
      }

      if (subject && htmlContent) {
        try {
          const emailResponse = await resend.emails.send({
            from: "NetLoversGH <notifications@resend.dev>",
            to: [userEmail],
            subject,
            html: htmlContent,
          });
          console.log("Email sent successfully:", emailResponse);
          emailSent = true;
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }
    }

    // Send WhatsApp if channel is whatsapp or both
    if ((channel === "whatsapp" || channel === "both") && userPhone) {
      const whatsappMessage = generateWhatsAppMessage(type, data);
      whatsappSent = await sendWhatsAppMessage(userPhone, whatsappMessage);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent, 
        whatsappSent,
        message: `Notification sent via ${emailSent && whatsappSent ? "email and WhatsApp" : emailSent ? "email" : whatsappSent ? "WhatsApp" : "none"}`
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
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
