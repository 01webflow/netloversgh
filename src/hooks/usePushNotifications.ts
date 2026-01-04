import { useState, useEffect, useCallback } from "react";

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: "default",
    isEnabled: false,
  });

  useEffect(() => {
    const isSupported = "Notification" in window;
    
    setState({
      isSupported,
      permission: isSupported ? Notification.permission : "denied",
      isEnabled: isSupported && Notification.permission === "granted",
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      console.log("Push notifications not supported");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({
        ...prev,
        permission,
        isEnabled: permission === "granted",
      }));
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (!state.isEnabled) {
        console.log("Notifications not enabled");
        return null;
      }

      try {
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return notification;
      } catch (error) {
        console.error("Error sending notification:", error);
        return null;
      }
    },
    [state.isEnabled]
  );

  const notifyOrderStatus = useCallback(
    (status: string, packageName: string) => {
      const statusMessages: Record<string, { title: string; body: string; icon: string }> = {
        processing: {
          title: "Order Processing 🔄",
          body: `Your order for ${packageName} is being processed`,
          icon: "/favicon.ico",
        },
        completed: {
          title: "Order Completed ✅",
          body: `Your ${packageName} data bundle has been delivered!`,
          icon: "/favicon.ico",
        },
        failed: {
          title: "Order Failed ❌",
          body: `Your order for ${packageName} could not be processed`,
          icon: "/favicon.ico",
        },
      };

      const message = statusMessages[status];
      if (message) {
        sendNotification(message.title, {
          body: message.body,
          tag: `order-${status}`,
        });
      }
    },
    [sendNotification]
  );

  return {
    ...state,
    requestPermission,
    sendNotification,
    notifyOrderStatus,
  };
};
