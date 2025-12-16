import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Suspense, lazy } from "react";

// Lazy load 3D component for performance
const Hero3D = lazy(() => import("@/components/hero/Hero3D"));

const Hero = () => {
  return (
    <section className="hero-gradient py-24 md:py-32 relative overflow-hidden min-h-[600px]">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 drop-shadow-lg">
          Your Trusted Data Bundle Provider
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto drop-shadow">
          Get affordable MTN, AirtelTigo & Telecel data bundles instantly. Fast, reliable, and secure.
        </p>
        <Link to="/register">
          <Button
            variant="outline"
            size="lg"
            className="bg-white/10 backdrop-blur-sm border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-medium px-8 py-3 text-base transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
