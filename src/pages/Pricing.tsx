import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Pricing
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Affordable data bundles for all networks. Get the best rates in Ghana.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <Pricing />
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
