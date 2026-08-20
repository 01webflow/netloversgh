import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SERVICES } from "@/lib/services";

const Services = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">PAY BILLS &amp; SERVICES</h1>
        </div>
        <p className="text-muted-foreground mb-8 ml-10">
          Electricity, water, airtime, AFA, result checkers and TV — all in one place.
        </p>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="glass-card hover-lift group p-6 animate-fade-in"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div
                className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <service.icon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{service.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{service.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
