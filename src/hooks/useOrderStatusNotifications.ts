import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderStatusPayload {
  new: {
    id: string;
    order_status: string;
    package_name: string;
    recipient_phone: string;
    user_id: string;
    price: number;
  };
  old: {
    order_status: string;
  };
}

export const useOrderStatusNotifications = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('order-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const { new: newOrder, old: oldOrder } = payload as unknown as OrderStatusPayload;
          
          // Only notify on status changes
          if (newOrder.order_status === oldOrder.order_status) return;

          // Show local toast notification
          const statusMessages: Record<string, { title: string; description: string; variant: "default" | "destructive" }> = {
            completed: {
              title: "Order Completed! ✅",
              description: `Your ${newOrder.package_name} has been delivered to ${newOrder.recipient_phone}`,
              variant: "default"
            },
            failed: {
              title: "Order Failed ❌",
              description: `Your order for ${newOrder.package_name} could not be processed. Please contact support.`,
              variant: "destructive"
            },
            processing: {
              title: "Order Processing ⏳",
              description: `Your ${newOrder.package_name} is being processed`,
              variant: "default"
            }
          };

          const message = statusMessages[newOrder.order_status];
          if (message) {
            if (message.variant === "destructive") {
              toast.error(message.title, { description: message.description });
            } else {
              toast.success(message.title, { description: message.description });
            }
          }

          // Also send notification through the notification service if completed or failed
          if (newOrder.order_status === 'completed' || newOrder.order_status === 'failed') {
            try {
              // Get user's notification preference
              const { data: profile } = await supabase
                .from('profiles')
                .select('notification_preference')
                .eq('user_id', userId)
                .single();

              const notificationChannel = profile?.notification_preference || 'email';
              
              // Only send if they have a valid preference (not 'none')
              if (notificationChannel !== 'none') {
                await supabase.functions.invoke('send-notification', {
                  body: {
                    type: 'order_status_update',
                    user_id: userId,
                    data: {
                      status: newOrder.order_status,
                      package_name: newOrder.package_name,
                      recipient_phone: newOrder.recipient_phone,
                      price: newOrder.price,
                    },
                    channel: notificationChannel,
                  },
                });
              }
            } catch (error) {
              console.error('Failed to send notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};
