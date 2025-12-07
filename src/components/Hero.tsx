import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="hero-gradient py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
          Your Trusted Data Bundle Provider
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
          Get affordable MTN, AirtelTigo & Telecel data bundles instantly. Fast, reliable, and secure.
        </p>
        <Link to="/register">
          <Button
            variant="outline"
            size="lg"
            className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary font-medium px-8 py-3 text-base"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
