import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingPlans = [
  {
    name: "Starter",
    network: "MTN",
    data: "1GB",
    price: "GHS 5.00",
    validity: "1 Day",
    color: "bg-mtn",
    features: ["Valid for 24 hours", "All networks", "Instant delivery"],
  },
  {
    name: "Basic",
    network: "MTN",
    data: "3GB",
    price: "GHS 12.00",
    validity: "7 Days",
    color: "bg-mtn",
    features: ["Valid for 7 days", "All networks", "Instant delivery", "24/7 support"],
  },
  {
    name: "Standard",
    network: "MTN",
    data: "10GB",
    price: "GHS 35.00",
    validity: "30 Days",
    color: "bg-mtn",
    popular: true,
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support", "Rollover data"],
  },
  {
    name: "Premium",
    network: "MTN",
    data: "25GB",
    price: "GHS 75.00",
    validity: "30 Days",
    color: "bg-mtn",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "Priority support", "Rollover data", "Bonus data"],
  },
  {
    name: "Lite",
    network: "AirtelTigo",
    data: "2GB",
    price: "GHS 8.00",
    validity: "3 Days",
    color: "bg-at",
    features: ["Valid for 3 days", "All networks", "Instant delivery"],
  },
  {
    name: "Value",
    network: "AirtelTigo",
    data: "8GB",
    price: "GHS 28.00",
    validity: "30 Days",
    color: "bg-at",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support"],
  },
  {
    name: "Flexi",
    network: "Telecel",
    data: "5GB",
    price: "GHS 18.00",
    validity: "14 Days",
    color: "bg-telecel",
    features: ["Valid for 14 days", "All networks", "Instant delivery", "Flexible usage"],
  },
  {
    name: "Max",
    network: "Telecel",
    data: "15GB",
    price: "GHS 50.00",
    validity: "30 Days",
    color: "bg-telecel",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support", "Night bonus"],
  },
];

const Pricing = () => {
  return (
    <section className="py-12 md:py-16 bg-secondary" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Data Bundle Packages
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Choose from our wide range of affordable data bundles for MTN, AirtelTigo, and Telecel.
          </p>
        </div>

        {/* MTN Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-10 bg-mtn rounded"></div>
            <h3 className="text-lg font-semibold text-foreground">MTN Bundles</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {pricingPlans.filter(p => p.network === "MTN").map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        {/* AirtelTigo Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-10 bg-at rounded"></div>
            <h3 className="text-lg font-semibold text-foreground">AirtelTigo Bundles</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg">
            {pricingPlans.filter(p => p.network === "AirtelTigo").map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        {/* Telecel Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-1 w-10 bg-telecel rounded"></div>
            <h3 className="text-lg font-semibold text-foreground">Telecel Bundles</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-lg">
            {pricingPlans.filter(p => p.network === "Telecel").map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

interface PricingCardProps {
  plan: {
    name: string;
    network: string;
    data: string;
    price: string;
    validity: string;
    color: string;
    popular?: boolean;
    features: string[];
  };
}

const PricingCard = ({ plan }: PricingCardProps) => {
  return (
    <div className={`bg-background rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
          <Zap className="inline h-3 w-3 mr-1" />
          Most Popular
        </div>
      )}
      <div className={`${plan.color} py-2 px-3`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-foreground">{plan.network}</span>
          <span className="text-[10px] bg-background/80 px-2 py-0.5 rounded text-foreground">{plan.validity}</span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-foreground mb-1">{plan.name}</h4>
        <div className="mb-2">
          <span className="text-2xl font-bold text-primary">{plan.data}</span>
        </div>
        <div className="text-lg font-bold text-foreground mb-3">{plan.price}</div>
        <ul className="space-y-1.5 mb-4">
          {plan.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-primary flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full h-9 text-sm">Buy Now</Button>
      </div>
    </div>
  );
};

export default Pricing;
