import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Suspense, lazy } from "react";
import { Wifi, Zap, Shield, ArrowRight } from "lucide-react";

// Lazy load 3D component for performance
const Hero3D = lazy(() => import("@/components/hero/Hero3D"));

const Hero = () => {
  return (
    <section className="hero-gradient py-20 md:py-28 relative overflow-hidden min-h-[700px]">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <Hero3D />
      </Suspense>
      
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-primary-foreground/90 text-sm font-medium">Instant Delivery Available</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 drop-shadow-lg">
              Your Trusted
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-cyan-300">
                Data Bundle Provider
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/85 mb-8 max-w-xl drop-shadow leading-relaxed">
              Get affordable MTN, AirtelTigo & Telecel data bundles instantly. Fast, reliable, and secure transactions with 24/7 support.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/bundles">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-base transition-all duration-300 hover:scale-105 hover:shadow-xl gap-2"
                >
                  Browse Bundles
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-2 border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-medium px-8 py-6 text-base transition-all duration-300"
                >
                  Create Account
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-primary-foreground/80 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-300" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-cyan-300" />
                <span>All Networks</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-300" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Content - Data Packages Card */}
          <div className="hidden lg:block">
            <div className="glass-card-strong p-6 rounded-3xl max-w-md ml-auto transform hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Popular Bundles</h3>
                <span className="bg-green-500/20 text-green-600 text-xs font-medium px-3 py-1 rounded-full">Live Prices</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { network: "MTN", data: "5GB", price: "₵25.00", color: "bg-yellow-400", textColor: "text-yellow-900" },
                  { network: "Telecel", data: "10GB", price: "₵45.00", color: "bg-red-500", textColor: "text-white" },
                  { network: "AT", data: "3GB", price: "₵18.00", color: "bg-blue-500", textColor: "text-white" },
                ].map((bundle, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${bundle.color} rounded-lg flex items-center justify-center`}>
                        <span className={`text-xs font-bold ${bundle.textColor}`}>{bundle.network}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{bundle.data} Bundle</p>
                        <p className="text-sm text-muted-foreground">30 days validity</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{bundle.price}</p>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/bundles" className="block mt-4">
                <Button variant="outline" className="w-full">
                  View All Bundles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
