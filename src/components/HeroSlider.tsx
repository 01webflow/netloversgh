import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";

const slides = [
  {
    title: "Get Data at Unbeatable Prices",
    subtitle: "Fast, reliable data bundles for MTN, AirtelTigo & Telecel",
    accent: "Featured",
    image: hero1,
  },
  {
    title: "MTN Swift Delivery",
    subtitle: "Instant data delivery to any MTN number in Ghana",
    accent: "Popular",
    image: hero2,
  },
  {
    title: "Share Data with Loved Ones",
    subtitle: "Send data bundles to family and friends instantly",
    accent: "Hot Deal",
    image: hero3,
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
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="container mx-auto px-4 h-full relative z-10">
        <div className="flex flex-col justify-center h-full max-w-xl">
          <span className="inline-block w-fit px-4 py-1.5 bg-primary/20 backdrop-blur-md rounded-full text-primary text-sm font-medium mb-4 animate-fade-in">
            {slides[currentSlide].accent}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 animate-slide-up">
            {slides[currentSlide].title}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 animate-slide-up">
            {slides[currentSlide].subtitle}
          </p>
          <div className="flex flex-wrap gap-4 animate-slide-up">
            <Link to="/bundles">
              <Button
                size="lg"
                className="font-medium px-8"
              >
                Buy Data Now
              </Button>
            </Link>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="border-2"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-background/70 transition-colors z-20"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-background/70 transition-colors z-20"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? "bg-primary w-8"
                : "bg-foreground/30 hover:bg-foreground/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
