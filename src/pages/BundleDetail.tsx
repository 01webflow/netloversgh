import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Bundle {
  id: string;
  provider: string;
  name: string;
  data_amount: string;
  price: number;
  delivery_type: string;
}

const providerNames: Record<string, string> = {
  mtn: "MTN",
  "at-bigtime": "AT",
  "at-ishare": "AT",
  telecel: "Telecel",
  "mtn-deals": "MTN",
};

const BundleDetail = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [useMyNumber, setUseMyNumber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBundles = async () => {
      const provider = providerNames[providerId || ""] || "MTN";
      const { data } = await supabase
        .from("data_bundles")
        .select("*")
        .eq("provider", provider)
        .eq("is_active", true)
        .order("price", { ascending: true });
      if (data) {
        setBundles(data);
      }
      setLoading(false);
    };
    fetchBundles();
  }, [providerId]);

  const handleAddToCart = (bundle: Bundle) => {
    if (!recipientPhone && !useMyNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter a recipient phone number",
        variant: "destructive",
      });
      return;
    }

    addItem({
      bundleId: bundle.id,
      provider: bundle.provider,
      name: bundle.name,
      dataAmount: bundle.data_amount,
      price: bundle.price,
      recipientPhone: useMyNumber ? "My Number" : recipientPhone,
      quantity: 1,
    });

    toast({
      title: "Added to Cart",
      description: `${bundle.data_amount} bundle added to cart`,
    });
  };

  const handleProceed = (bundle: Bundle) => {
    if (!recipientPhone && !useMyNumber) {
      toast({
        title: "Phone Required",
        description: "Please enter a recipient phone number",
        variant: "destructive",
      });
      return;
    }

    navigate("/checkout", {
      state: {
        bundle,
        recipientPhone: useMyNumber ? "My Number" : recipientPhone,
      },
    });
  };

  const getProviderLogo = () => {
    if (providerId?.includes("mtn")) {
      return (
        <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold">MTN</span>
        </div>
      );
    }
    if (providerId?.includes("at")) {
      return (
        <div className="text-2xl font-bold">
          <span className="text-red-500">a</span>
          <span className="text-primary">t</span>
        </div>
      );
    }
    return <span className="text-xl font-bold text-red-500">telecel</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/bundles" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground uppercase">
            {providerId?.replace("-", " ")} BUNDLE
          </h1>
        </div>

        {/* Info Card */}
        <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
          <div className="flex items-start gap-4">
            {getProviderLogo()}
            <div className="flex-1">
              <p className="text-foreground">
                Please note: This package only delivers during regular business hours
              </p>
              <p className="text-sm text-muted-foreground mt-1">🚀 Auto placer enabled</p>
            </div>
          </div>
          <div className="mt-4 bg-yellow-400 text-foreground text-sm px-4 py-2 rounded-lg inline-block">
            THIS PACKAGE IS NOT ELIGIBLE FOR TURBONET CARDS
          </div>
        </div>

        {/* Phone Input */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">
            Number you would like to send the package to eg. 024*****
          </p>
          <Input
            placeholder="Recipient Phone Number"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            className="text-lg py-6"
            disabled={useMyNumber}
          />
          <div className="flex items-center justify-between mt-4">
            <Button variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
              <span className="mr-2">T</span> Text Input Orders
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Use my number</span>
              <Switch checked={useMyNumber} onCheckedChange={setUseMyNumber} />
            </div>
          </div>
        </div>

        {/* Packages */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Select your package</h3>
          <div className="space-y-4">
            {bundles.map((bundle) => (
              <div
                key={bundle.id}
                className="bg-card rounded-2xl p-6 border border-border flex items-center justify-between"
              >
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    ₵ {bundle.price.toFixed(2)} - {bundle.data_amount}
                  </h4>
                  <Button
                    size="sm"
                    className="mt-2 bg-primary hover:bg-primary/90"
                    onClick={() => handleAddToCart(bundle)}
                  >
                    ₵ {bundle.price.toFixed(2)}
                  </Button>
                </div>
                <Button
                  size="icon"
                  className="bg-primary hover:bg-primary/90 rounded-full w-12 h-12"
                  onClick={() => handleProceed(bundle)}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BundleDetail;
