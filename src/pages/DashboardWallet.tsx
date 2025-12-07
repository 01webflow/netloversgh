import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import WalletCard from "@/components/dashboard/WalletCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  wallet_balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

const DashboardWallet = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (profileData) {
          setProfile(profileData);
        }

        const { data: txData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (txData) {
          setTransactions(txData);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleFundWallet = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Coming Soon",
      description: "Wallet funding will be available once payment integration is complete",
    });
    setShowFundModal(false);
    setFundAmount("");
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
          <header className="sticky top-0 z-40 bg-background border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <h1 className="text-xl font-semibold text-foreground">Wallet</h1>
            </div>
            <Button onClick={() => setShowFundModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Fund Wallet
            </Button>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6 lg:p-8">
            {/* Wallet Card */}
            <WalletCard
              email={user.email || ""}
              balance={profile?.wallet_balance || 0}
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => setShowFundModal(true)}
              >
                <ArrowDownLeft className="h-6 w-6 text-green-500" />
                <span>Deposit</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/bundles")}
              >
                <ArrowUpRight className="h-6 w-6 text-primary" />
                <span>Buy Data</span>
              </Button>
            </div>

            {/* Recent Transactions */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Recent Transactions
              </h3>
              {transactions.length === 0 ? (
                <div className="bg-card rounded-xl p-6 text-center text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-card rounded-xl p-4 flex items-center justify-between border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === "credit"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {tx.type === "credit" ? (
                            <ArrowDownLeft className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {tx.description || tx.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold ${
                          tx.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}₵{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Fund Modal */}
          {showFundModal && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl p-6 w-full max-w-md border border-border shadow-lg">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Fund Your Wallet
                </h3>
                <Input
                  type="number"
                  placeholder="Enter amount (GHS)"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowFundModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleFundWallet}>
                    Proceed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardWallet;
