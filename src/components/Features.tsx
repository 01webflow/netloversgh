import { Rocket, Headphones, Tag } from "lucide-react";
const features = [{
  icon: Rocket,
  title: "Fast Delivery",
  description: "Get your data in less than 15 minutes after purchase."
}, {
  icon: Headphones,
  title: "24/7 Support",
  description: "Our support team is always available to assist you."
}, {
  icon: Tag,
  title: "Discounted Prices",
  description: "Enjoy exclusive discounts for agents and bulk purchases."
}];
const Features = () => {
  return <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-primary text-center mb-12 md:mb-16">Why Choose NetLovers GH?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => <div key={index} className="feature-card bg-card rounded-lg p-8 text-center shadow-sm border border-border">
              <div className="flex justify-center mb-6">
                <feature.icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default Features;