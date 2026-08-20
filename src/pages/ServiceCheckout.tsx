import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getService } from "@/lib/services";

const ServiceCheckout = () => {
  const { slug } = useParams();
  const service = getService(slug);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [provider, setProvider] = useState(service?.providers[0]?.id ?? "");
  const [packageId, setPackageId] = useState(service?.packages?.[0]?.id ?? "");
  const [account, setAccount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setBalance(Number(data?.wallet_balance ?? 0)));
  }, [user]);

  const selectedPackage = useMemo(
    () => service?.packages?.find((p) => p.id === packageId),
    [service, packageId]
  );

  const amount = selectedPackage
    ? selectedPackage.amount
    : Number(customAmount || 0);

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <Link to="/services" className="text-primary hover:underline">
            Back to services
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (service.accountPattern && !service.accountPattern.test(account.trim())) {
      toast({
        title: "Invalid number",
        description: service.accountHint || "Please check the number you entered.",
        variant: "destructive",
      });
      return;
    }
    if (!account.trim()) {
      toast({ title: `${service.accountLabel} is required`, variant: "destructive" });
      return;
    }
    if (!amount || amount <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (service.minAmount && amount < service.minAmount) {
      toast({ title: `Minimum amount is GHS ${service.minAmount}`, variant: "destructive" });
      return;
    }
    if (service.maxAmount && amount > service.maxAmount) {
      toast({ title: `Maximum amount is GHS ${service.maxAmount}`, variant: "destructive" });
      return;
    }
    if (balance !== null && balance < amount) {
      toast({
        title: "Insufficient wallet balance",
        description: "Top up your wallet to complete this purchase.",
        variant: "destructive",
      });
      navigate("/dashboard/wallet");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("service_orders").insert({
      user_id: user.id,
      service_type: service.type,
      provider,
      account_number: account.trim(),
      package_name: selectedPackage?.name ?? `${service.title} top-up`,
      amount,
      payment_method: "wallet",
      details: {
        service_slug: service.slug,
        provider_name: service.providers.find((p) => p.id === provider)?.name,
      },
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Order failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setDone(true);
    setBalance((b) => (b === null ? b : b - amount));
    toast({
      title: "Order placed",
      description: `${service.title} request for GHS ${amount.toFixed(2)} received.`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/services" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{service.title}</h1>
        </div>

        {done ? (
          <div className="glass-card p-8 text-center animate-fade-in">
            <CheckCircle2 className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request received</h2>
            <p className="text-muted-foreground mb-6">
              We're processing your {service.title.toLowerCase()} order. You'll be notified as
              soon as it's delivered.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/dashboard/services")}>View my services</Button>
              <Button variant="outline" onClick={() => navigate("/services")}>
                Buy another
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5 animate-fade-in">
            <div
              className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center shadow-lg`}
            >
              <service.icon className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">{service.tagline}</p>

            {service.providers.length > 1 && (
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {service.providers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="account">{service.accountLabel}</Label>
              <Input
                id="account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={service.accountPlaceholder}
                required
              />
              {service.accountHint && (
                <p className="text-xs text-muted-foreground">{service.accountHint}</p>
              )}
            </div>

            {service.packages?.length ? (
              <div className="space-y-2">
                <Label>Package</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {service.packages.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPackageId(p.id)}
                      className={`text-left rounded-xl border p-3 transition-all duration-200 hover:scale-[1.02] ${
                        packageId === p.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="block text-sm font-medium">{p.name}</span>
                      <span className="block text-sm text-primary font-semibold">
                        GHS {p.amount.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (GHS)</Label>
                <Input
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  min={service.minAmount}
                  max={service.maxAmount}
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={`Min ${service.minAmount ?? 1}`}
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" /> Wallet balance
              </span>
              <span className="font-semibold">
                {balance === null ? "—" : `GHS ${balance.toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">GHS {amount.toFixed(2)}</span>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {user ? "Pay from wallet" : "Sign in to continue"}
            </Button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceCheckout;
