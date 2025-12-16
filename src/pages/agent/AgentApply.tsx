import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Users, TrendingUp, Wallet, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AgentApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to apply as an agent");
      navigate("/login");
      return;
    }

    if (!formData.business_name || !formData.phone) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("agents").insert({
      user_id: user.id,
      business_name: formData.business_name,
      phone: formData.phone,
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("You have already applied as an agent");
        navigate("/agent/dashboard");
      } else {
        toast.error("Failed to submit application");
      }
      return;
    }

    toast.success("Application submitted successfully!");
    navigate("/agent/dashboard");
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Earn Commissions",
      description: "Get 5% commission on every sale you make",
    },
    {
      icon: Wallet,
      title: "Wallet Payouts",
      description: "Request payouts directly to your wallet",
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: "Grow your customer base and increase earnings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Become an Agent</h1>
            <p className="text-muted-foreground text-lg">
              Join our reseller program and start earning commissions on every sale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass-card text-center">
                <CardContent className="pt-6">
                  <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Agent Application</CardTitle>
              <CardDescription>
                Fill in your details to apply as a reseller agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    placeholder="Your business or shop name"
                    value={formData.business_name}
                    onChange={(e) =>
                      setFormData({ ...formData, business_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="0551234567"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>5% commission on all sales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Minimum payout: GHS 10.00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Instant wallet payouts</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Apply Now"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgentApply;
