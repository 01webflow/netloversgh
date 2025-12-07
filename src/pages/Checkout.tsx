import { useLocation, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Profile {
  wallet_balance: number;
}

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const { bundle, recipientPhone } = location.state || {};

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No order found</p>
          <Link to="/bundles">
            <Button>Browse Bundles</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to complete your order",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!selectedPayment) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    // Create order
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      bundle_id: bundle.id,
      recipient_phone: recipientPhone,
      package_name: bundle.name,
      data_amount: bundle.data_amount,
      price: bundle.price,
      payment_method: selectedPayment,
      payment_status: "pending",
      order_status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Order Placed!",
      description: "Your order has been placed successfully.",
    });

    navigate("/dashboard/orders");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">CONFIRM ORDER</h1>
        </div>

        {/* Order Summary Card */}
        <div className="bg-card rounded-2xl p-6 border border-border mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">MTN</span>
            </div>
            <p className="text-foreground">
              Make sure the number entered is correct. There will be no reversal or refund after
              completing transaction
            </p>
          </div>
          <hr className="border-border mb-4" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-pink-500 font-medium">Recipient #{recipientPhone}</span>
              <span className="text-foreground">{bundle.data_amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pink-500 font-medium">Charge value</span>
              <span className="text-foreground">GHS {bundle.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pink-500 font-medium">Reward bonus</span>
              <span className="text-foreground">{Math.floor(bundle.price / 10)}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-muted-foreground mb-4">
            Select payment method to process your order
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSelectedPayment("momo")}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                selectedPayment === "momo"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-green-600">≡ paystack</span>
              </div>
              <span className="font-medium text-foreground">Mobile Money</span>
            </button>

            <button
              onClick={() => setSelectedPayment("wallet")}
              className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                selectedPayment === "wallet"
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary">●NetLoversGH</span>
              </div>
              <span className="font-medium text-foreground">
                Low Balance ₵ {profile?.wallet_balance?.toFixed(2) || "0.00"}
              </span>
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-6 bg-primary text-primary-foreground rounded-xl p-4 flex items-center justify-between">
            <p className="text-sm">
              You can escape charges by making payments with our wallet
            </p>
            <button className="bg-primary-foreground/20 p-2 rounded-lg">
              <QrCode className="h-6 w-6" />
            </button>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmOrder}
            className="w-full mt-6"
            size="lg"
            disabled={!selectedPayment}
          >
            Confirm Order
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
