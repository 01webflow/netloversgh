import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, Wallet, Clock, ArrowRight, Copy, Link, Share2 } from "lucide-react";
import { toast } from "sonner";

interface AgentData {
  id: string;
  business_name: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  pending_payout: number;
  status: string;
  referral_code: string | null;
}

interface Sale {
  id: string;
  sale_amount: number;
  commission_amount: number;
  status: string;
  created_at: string;
}

const AgentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const referralLink = agent?.referral_code
    ? `${window.location.origin}/bundles?ref=${agent.referral_code}`
    : "";

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    const fetchAgentData = async () => {
      if (!user) return;

      const { data: agentData, error: agentError } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (agentError || !agentData) {
        navigate("/agent/apply");
        return;
      }

      setAgent(agentData as AgentData);

      const { data: salesData } = await supabase
        .from("agent_sales")
        .select("*")
        .eq("agent_id", agentData.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setSales((salesData as Sale[]) || []);
      setLoading(false);
    };

    fetchAgentData();
  }, [user, authLoading, navigate]);

  const requestPayout = async () => {
    if (!agent || agent.pending_payout < 10) {
      toast.error("Minimum payout is GHS 10.00");
      return;
    }

    const { error } = await supabase.from("agent_payouts").insert({
      agent_id: agent.id,
      amount: agent.pending_payout,
      payment_method: "wallet",
    });

    if (error) {
      toast.error("Failed to request payout");
      return;
    }

    toast.success("Payout request submitted!");
  };

  const copyReferralCode = () => {
    if (agent?.referral_code) {
      navigator.clipboard.writeText(agent.referral_code);
      toast.success("Referral code copied!");
    }
  };

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success("Referral link copied!");
    }
  };

  const shareReferralLink = async () => {
    if (referralLink && navigator.share) {
      try {
        await navigator.share({
          title: "NetLoversGH Data Bundles",
          text: "Get amazing data bundle deals! Use my referral link:",
          url: referralLink,
        });
      } catch (err) {
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (agent?.status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full text-center">
          <CardContent className="pt-6">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Application Pending</h2>
            <p className="text-muted-foreground">
              Your agent application is being reviewed. We'll notify you once approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agent?.status === "suspended") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full text-center border-destructive">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-destructive mb-2">Account Suspended</h2>
            <p className="text-muted-foreground">
              Your agent account has been suspended. Please contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {agent?.business_name}</p>
        </div>

        {/* Referral Section */}
        <Card className="glass-card mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              Your Referral Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block">Referral Code</label>
                <div className="flex gap-2">
                  <Input
                    value={agent?.referral_code || ""}
                    readOnly
                    className="font-mono text-lg bg-muted"
                  />
                  <Button variant="outline" size="icon" onClick={copyReferralCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm bg-muted"
                />
                <Button variant="outline" size="icon" onClick={copyReferralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" onClick={shareReferralLink}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Share this link with customers. You'll earn <strong>{agent?.commission_rate}%</strong> commission on all orders placed through your link!
            </p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono-numbers">
                GHS {agent?.total_sales?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commission Rate
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono-numbers">
                {agent?.commission_rate || 5}%
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 font-mono-numbers">
                GHS {agent?.total_commission?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Payout
              </CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary font-mono-numbers">
                GHS {agent?.pending_payout?.toFixed(2) || "0.00"}
              </div>
              <Button
                size="sm"
                className="mt-2 w-full"
                onClick={requestPayout}
                disabled={!agent || agent.pending_payout < 10}
              >
                Request Payout
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sales */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {sales.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No sales yet. Share your referral link to start earning commissions!
              </p>
            ) : (
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">Sale: GHS {sale.sale_amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +GHS {sale.commission_amount.toFixed(2)}
                      </p>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                        {sale.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentDashboard;
