import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingPlans = [
  {
    name: "Starter",
    network: "MTN",
    data: "1GB",
    price: "GHS 5.00",
    validity: "1 Day",
    color: "bg-yellow-400",
    features: ["Valid for 24 hours", "All networks", "Instant delivery"],
  },
  {
    name: "Basic",
    network: "MTN",
    data: "3GB",
    price: "GHS 12.00",
    validity: "7 Days",
    color: "bg-yellow-400",
    features: ["Valid for 7 days", "All networks", "Instant delivery", "24/7 support"],
  },
  {
    name: "Standard",
    network: "MTN",
    data: "10GB",
    price: "GHS 35.00",
    validity: "30 Days",
    color: "bg-yellow-400",
    popular: true,
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support", "Rollover data"],
  },
  {
    name: "Premium",
    network: "MTN",
    data: "25GB",
    price: "GHS 75.00",
    validity: "30 Days",
    color: "bg-yellow-400",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "Priority support", "Rollover data", "Bonus data"],
  },
  {
    name: "Lite",
    network: "AirtelTigo",
    data: "2GB",
    price: "GHS 8.00",
    validity: "3 Days",
    color: "bg-primary",
    features: ["Valid for 3 days", "All networks", "Instant delivery"],
  },
  {
    name: "Value",
    network: "AirtelTigo",
    data: "8GB",
    price: "GHS 28.00",
    validity: "30 Days",
    color: "bg-primary",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support"],
  },
  {
    name: "Flexi",
    network: "Telecel",
    data: "5GB",
    price: "GHS 18.00",
    validity: "14 Days",
    color: "bg-red-500",
    features: ["Valid for 14 days", "All networks", "Instant delivery", "Flexible usage"],
  },
  {
    name: "Max",
    network: "Telecel",
    data: "15GB",
    price: "GHS 50.00",
    validity: "30 Days",
    color: "bg-red-500",
    features: ["Valid for 30 days", "All networks", "Instant delivery", "24/7 support", "Night bonus"],
  },
];

const Pricing = () => {
  return (
    <section className="py-16 bg-secondary" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Data Bundle Packages
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our wide range of affordable data bundles. Get the best rates for MTN, AirtelTigo, and Telecel networks.
          </p>
        </div>

        {/* MTN Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-yellow-400 rounded"></div>
            <h3 className="text-xl font-semibold text-foreground">MTN Bundles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.filter(p => p.network === "MTN").map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        {/* AirtelTigo Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-primary rounded"></div>
            <h3 className="text-xl font-semibold text-foreground">AirtelTigo Bundles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            {pricingPlans.filter(p => p.network === "AirtelTigo").map((plan) => (
              <PricingCard key={plan.name} plan={plan} />
            ))}
          </div>
        </div>

        {/* Telecel Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-red-500 rounded"></div>
            <h3 className="text-xl font-semibold text-foreground">Telecel Bundles</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          <Zap className="inline h-4 w-4 mr-1" />
          Most Popular
        </div>
      )}
      <div className={`${plan.color} py-3 px-4`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{plan.network}</span>
          <span className="text-xs bg-background/80 px-2 py-1 rounded text-foreground">{plan.validity}</span>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h4>
        <div className="mb-4">
          <span className="text-3xl font-bold text-primary">{plan.data}</span>
        </div>
        <div className="text-2xl font-bold text-foreground mb-6">{plan.price}</div>
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button className="w-full">Buy Now</Button>
      </div>
    </div>
  );
};

export default Pricing;
