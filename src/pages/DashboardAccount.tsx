import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Menu, User, Mail, Phone, Save, Bell, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  full_name: string | null;
  phone: string | null;
  wallet_balance: number;
  notification_preference: string | null;
}

const DashboardAccount = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    notificationPreference: "email",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, wallet_balance, notification_preference")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
          setFormData({
            fullName: data.full_name || "",
            phone: data.phone || "",
            notificationPreference: data.notification_preference || "email",
          });
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.fullName,
        phone: formData.phone,
        notification_preference: formData.notificationPreference,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background border-b border-border p-4 flex items-center gap-4">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold text-foreground">Account Details</h1>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6 lg:p-8 max-w-2xl">
            {/* Profile Card */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {profile?.full_name || "User"}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={user.email || ""}
                      disabled
                      className="pl-10 bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences Card */}
            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you'd like to receive notifications about orders and wallet updates.
              </p>

              <RadioGroup
                value={formData.notificationPreference}
                onValueChange={(value) =>
                  setFormData({ ...formData, notificationPreference: value })
                }
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="email" id="email-pref" />
                  <Label htmlFor="email-pref" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Only</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="whatsapp" id="whatsapp-pref" />
                  <Label htmlFor="whatsapp-pref" className="flex items-center gap-2 cursor-pointer flex-1">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium">WhatsApp Only</p>
                      <p className="text-sm text-muted-foreground">Receive notifications via WhatsApp</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="both" id="both-pref" />
                  <Label htmlFor="both-pref" className="flex items-center gap-2 cursor-pointer flex-1">
                    <div className="flex -space-x-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <MessageSquare className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Both Email & WhatsApp</p>
                      <p className="text-sm text-muted-foreground">Receive notifications on both channels</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="none" id="none-pref" />
                  <Label htmlFor="none-pref" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Bell className="h-4 w-4 text-muted-foreground line-through" />
                    <div>
                      <p className="font-medium">No Notifications</p>
                      <p className="text-sm text-muted-foreground">Disable all external notifications</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full mb-6">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="text-muted-foreground text-sm mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-primary">
                  ₵{profile?.wallet_balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="text-muted-foreground text-sm mb-1">Account Status</p>
                <p className="text-2xl font-bold text-green-500">Active</p>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardAccount;
