import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import WalletCard from "@/components/dashboard/WalletCard";
import QuickMenu from "@/components/dashboard/QuickMenu";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  full_name: string | null;
  wallet_balance: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

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
          .select("full_name, wallet_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

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
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 bg-background border-b border-border p-4 flex items-center justify-between md:hidden">
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <span className="font-semibold">NetLoversGH</span>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                99
              </span>
            </Button>
          </header>

          {/* Main Content */}
          <main className="p-4 md:p-6 lg:p-8">
            {/* Welcome Section */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome, <span className="text-muted-foreground font-normal">unbeatable prices</span>
              </h1>
            </div>

            {/* Wallet Card */}
            <WalletCard
              email={user.email || ""}
              balance={profile?.wallet_balance || 0}
            />

            {/* Featured Banner - Glassmorphism */}
            <div className="mt-6 bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-primary-foreground/5 backdrop-blur-sm" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">AT Ishare & Big Data Bundles</h3>
                  <p className="text-primary-foreground/70 text-sm mt-1">
                    Get the best rates on data bundles
                  </p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i === 0 ? "bg-primary-foreground" : "bg-primary-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Menu */}
            <QuickMenu />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
