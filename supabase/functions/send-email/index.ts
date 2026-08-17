import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "agent_approved" | "agent_rejected" | "order_completed" | "order_failed" | "order_processing" | "refund_processed";
  to?: string;
  user_id?: string;
  data: {
    name?: string;
    businessName?: string;
    referralCode?: string;
    orderDetails?: {
      packageName: string;
      dataAmount: string;
      recipientPhone: string;
      price: number;
    };
    reason?: string;
    package_name?: string;
    data_amount?: string;
    price?: number;
    recipient_phone?: string;
    refund_amount?: number;
  };
}

const getEmailContent = (type: string, data: EmailRequest["data"]) => {
  switch (type) {
    case "agent_approved":
      return {
        subject: "🎉 Welcome to NetLovers Agent Program!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome Aboard! 🎊</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Congratulations, ${data.businessName}!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your agent application has been approved! You're now part of the NetLovers Agent Program.
              </p>
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #7c3aed; margin-top: 0;">Your Referral Code</h3>
                <div style="background: #7c3aed; color: white; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 2px;">
                  ${data.referralCode}
                </div>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Share this code with your customers and earn commissions on every sale!
              </p>
              <div style="margin-top: 30px;">
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.dev')}/agent/dashboard" 
                   style="background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                  Go to Agent Dashboard
                </a>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    case "agent_rejected":
      return {
        subject: "Agent Application Update",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1f2937; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Application Update</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Hello, ${data.businessName}</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                We've reviewed your agent application and unfortunately, we're unable to approve it at this time.
              </p>
              ${data.reason ? `<p style="color: #4b5563; font-size: 16px; line-height: 1.6;"><strong>Reason:</strong> ${data.reason}</p>` : ''}
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                You're welcome to reapply in the future. Thank you for your interest in our Agent Program.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    case "order_completed":
      return {
        subject: "✅ Order Completed Successfully!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Completed! ✅</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Great news!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Your data bundle order has been successfully delivered.
              </p>
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #10b981; margin-top: 0;">Order Details</h3>
                <p style="margin: 8px 0;"><strong>Package:</strong> ${data.orderDetails?.packageName}</p>
                <p style="margin: 8px 0;"><strong>Data:</strong> ${data.orderDetails?.dataAmount}</p>
                <p style="margin: 8px 0;"><strong>Recipient:</strong> ${data.orderDetails?.recipientPhone}</p>
                <p style="margin: 8px 0;"><strong>Amount:</strong> GHS ${data.orderDetails?.price.toFixed(2)}</p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Thank you for choosing NetLovers!
              </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    case "order_failed":
      return {
        subject: "❌ Order Failed - Action Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #f87171 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Failed ❌</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">We're sorry</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                Unfortunately, your order could not be processed.
              </p>
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #ef4444; margin-top: 0;">Order Details</h3>
                <p style="margin: 8px 0;"><strong>Package:</strong> ${data.orderDetails?.packageName}</p>
                <p style="margin: 8px 0;"><strong>Data:</strong> ${data.orderDetails?.dataAmount}</p>
                <p style="margin: 8px 0;"><strong>Recipient:</strong> ${data.orderDetails?.recipientPhone}</p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                If you paid via wallet, your balance has been refunded. Please try again or contact support.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    case "order_processing":
      return {
        subject: "📦 Order Being Processed",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Processing 📦</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Your order is on its way!</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                We're processing your data bundle order. It should be delivered shortly.
              </p>
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #3b82f6; margin-top: 0;">Order Details</h3>
                <p style="margin: 8px 0;"><strong>Package:</strong> ${data.orderDetails?.packageName}</p>
                <p style="margin: 8px 0;"><strong>Data:</strong> ${data.orderDetails?.dataAmount}</p>
                <p style="margin: 8px 0;"><strong>Recipient:</strong> ${data.orderDetails?.recipientPhone}</p>
              </div>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    case "refund_processed":
      return {
        subject: "💸 Refund Processed - NetLoversGH",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Refund Processed 💸</h1>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937;">Your refund has been processed</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                We've processed a refund for your failed order. The amount has been credited to your wallet.
              </p>
              <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
                <h3 style="color: #8b5cf6; margin-top: 0;">Refund Details</h3>
                <p style="margin: 8px 0;"><strong>Package:</strong> ${data.package_name || data.orderDetails?.packageName || "N/A"}</p>
                <p style="margin: 8px 0;"><strong>Data:</strong> ${data.data_amount || data.orderDetails?.dataAmount || "N/A"}</p>
                <p style="margin: 8px 0;"><strong>Refund Amount:</strong> GHS ${(data.refund_amount || data.price || data.orderDetails?.price || 0).toFixed(2)}</p>
              </div>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                You can use your wallet balance to purchase another data bundle. We apologize for any inconvenience.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>NetLovers - Your Trusted Data Bundle Provider</p>
            </div>
          </div>
        `,
      };

    default:
      return {
        subject: "NetLovers Notification",
        html: "<p>You have a new notification from NetLovers.</p>",
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // AuthZ: only the backend (service role), admins, or the recipient themselves
    const serviceCall = isServiceRole(req);
    let caller: { id: string; email: string | null } | null = null;
    if (!serviceCall) {
      caller = await getAuthenticatedUser(req);
      if (!caller) return unauthorized(corsHeaders);
    }

    const requestBody = await req.json() as EmailRequest;
    const { type, to, user_id, data } = requestBody;

    let targetUserId = user_id;
    let recipientEmail = to;

    if (!serviceCall && caller) {
      const callerIsAdmin = await isAdmin(caller.id);
      if (!callerIsAdmin) {
        // Non-admins may only email themselves
        targetUserId = caller.id;
        recipientEmail = caller.email ?? undefined;
      }
    }

    if (!recipientEmail && targetUserId) {
      // Look up user email from Supabase
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const userResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${targetUserId}`, {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        recipientEmail = userData.email;
      }
    }

    
    if (!recipientEmail) {
      console.error("No recipient email found");
      return new Response(JSON.stringify({ error: "No recipient email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("Sending email:", { type, to: recipientEmail });

    const { subject, html } = getEmailContent(type, data);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "NetLovers <onboarding@resend.dev>",
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    const responseData = await emailResponse.json();
    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, id: responseData?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
