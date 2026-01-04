import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

export const PushNotificationToggle = () => {
  const { isSupported, isEnabled, permission, requestPermission } = usePushNotifications();
  const { toast } = useToast();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (permission === "denied") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      });
      return;
    }

    if (!isEnabled) {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive updates about your orders",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "You won't receive push notifications",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant={isEnabled ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      {isEnabled ? (
        <>
          <Bell className="h-4 w-4" />
          Notifications On
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          Enable Notifications
        </>
      )}
    </Button>
  );
};
