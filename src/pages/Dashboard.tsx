import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import WalletCard from "@/components/dashboard/WalletCard";
import QuickMenu from "@/components/dashboard/QuickMenu";
import { UsageSummaryWidget } from "@/components/dashboard/widgets/UsageSummaryWidget";
import { WalletInsightsWidget } from "@/components/dashboard/widgets/WalletInsightsWidget";
import { QuickBuyWidget } from "@/components/dashboard/widgets/QuickBuyWidget";
import { LiveOrderTracker } from "@/components/dashboard/widgets/LiveOrderTracker";
import { Bell, Menu, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useOrderStatusNotifications } from "@/hooks/useOrderStatusNotifications";

interface Profile {
  full_name: string | null;
  wallet_balance: number;
}

interface Order {
  id: string;
  package_name: string;
  data_amount: string;
  price: number;
  recipient_phone: string;
  bundle_id: string | null;
  order_status: string;
  created_at: string;
}

interface Transaction {
  type: string;
  amount: number;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlySpending, setMonthlySpending] = useState({ current: 0, previous: 0 });
  const [quickBuyLoading, setQuickBuyLoading] = useState(false);

  // Enable real-time order status notifications
  useOrderStatusNotifications(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, wallet_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileData) setProfile(profileData);

        // Fetch recent orders
        const { data: ordersData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (ordersData) setOrders(ordersData);

        // Fetch recent transactions
        const { data: transData } = await supabase
          .from("transactions")
          .select("type, amount")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (transData) setTransactions(transData);

        // Calculate monthly spending
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const currentMonthOrders = ordersData?.filter(o => 
          new Date(o.created_at) >= currentMonthStart
        ) || [];
        const previousMonthOrders = ordersData?.filter(o => 
          new Date(o.created_at) >= previousMonthStart && new Date(o.created_at) < currentMonthStart
        ) || [];

        setMonthlySpending({
          current: currentMonthOrders.reduce((sum, o) => sum + o.price, 0),
          previous: previousMonthOrders.reduce((sum, o) => sum + o.price, 0)
        });
      }
    };
    fetchDashboardData();
  }, [user]);

  const handleQuickBuy = async () => {
    const lastOrder = orders.find(o => o.order_status === 'completed');
    if (!lastOrder || !lastOrder.bundle_id) {
      toast({
        title: "Unable to Quick Buy",
        description: "No previous order bundle found",
        variant: "destructive"
      });
      return;
    }

    setQuickBuyLoading(true);
    
    // Fetch the bundle details
    const { data: bundle } = await supabase
      .from("data_bundles")
      .select("*")
      .eq("id", lastOrder.bundle_id)
      .maybeSingle();

    if (bundle) {
      navigate("/checkout", {
        state: {
          bundle,
          recipientPhone: lastOrder.recipient_phone
        }
      });
    }
    
    setQuickBuyLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const lastCompletedOrder = orders.find(o => o.order_status === 'completed');

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background gradient-mesh">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Mobile Header */}
          <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 p-4 flex items-center justify-between md:hidden">
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            <span className="font-semibold gradient-primary bg-clip-text text-transparent">NetLoversGH</span>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                3
              </span>
            </Button>
          </header>

          {/* Main Content */}
          <main className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome back! <Sparkles className="inline h-6 w-6 text-accent" />
                </h1>
                <p className="text-muted-foreground mt-1">Here's your dashboard overview</p>
              </div>
            </div>

            {/* Wallet Card */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <WalletCard
                email={user.email || ""}
                balance={profile?.wallet_balance || 0}
              />
            </div>

            {/* Smart Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <UsageSummaryWidget 
                  currentMonth={monthlySpending.current}
                  previousMonth={monthlySpending.previous}
                  totalOrders={orders.length}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
                <WalletInsightsWidget 
                  balance={profile?.wallet_balance || 0}
                  recentTransactions={transactions}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <QuickBuyWidget 
                  lastOrder={lastCompletedOrder || null}
                  onQuickBuy={handleQuickBuy}
                  isLoading={quickBuyLoading}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
                <LiveOrderTracker recentOrders={orders.slice(0, 5)} />
              </div>
            </div>

            {/* Featured Banner - Glassmorphism */}
            <div className="glass-card-strong overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-20 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">AT Ishare & Big Data Bundles</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Get the best rates on data bundles
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === 0 ? "bg-primary scale-125" : "bg-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Menu */}
            <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
              <QuickMenu />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
