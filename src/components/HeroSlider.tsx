import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "AT Ishare & Big Data Bundles",
    subtitle: "Get affordable data at unbeatable prices",
    accent: "Featured",
  },
  {
    title: "MTN Swift Delivery",
    subtitle: "Instant data delivery to any MTN number",
    accent: "Popular",
  },
  {
    title: "Telecel Super Deals",
    subtitle: "Amazing discounts on Telecel bundles",
    accent: "Hot Deal",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="hero-gradient py-16 md:py-24 relative overflow-hidden">
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-primary-foreground/5 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block px-4 py-1 bg-primary-foreground/20 backdrop-blur-md rounded-full text-primary-foreground text-sm font-medium mb-4">
              {slides[currentSlide].accent}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4 transition-all duration-500">
              {slides[currentSlide].title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 transition-all duration-500">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/bundles">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium px-8"
                >
                  Buy Data Now
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Glassmorphism card */}
          <div className="flex-1 max-w-md w-full">
            <div className="bg-primary-foreground/10 backdrop-blur-lg rounded-2xl p-6 border border-primary-foreground/20 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-primary-foreground/70 text-sm">Campaign</span>
                <span className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary-foreground rounded-full animate-pulse" />
                </span>
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <p className="text-primary-foreground font-bold text-2xl">
                    {slides[currentSlide].title.split(" ")[0]}
                  </p>
                  <p className="text-primary-foreground/60 text-sm">
                    Best Prices
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-primary-foreground w-6"
                        : "bg-primary-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-foreground/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-foreground/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default HeroSlider;
