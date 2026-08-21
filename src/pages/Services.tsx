import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { SERVICES, SERVICE_CATEGORIES } from "@/lib/services";

const Services = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((s) => {
      if (category !== "All" && s.category !== category) return false;
      if (!q) return true;
      const haystack = [
        s.title,
        s.tagline,
        s.category,
        ...(s.keywords ?? []),
        ...s.providers.map((p) => p.name),
        ...(s.packages ?? []).map((p) => p.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, category]);

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
        <p className="text-muted-foreground mb-6 ml-10">
          Electricity, water, airtime, AFA, result checkers and TV — all in one place.
        </p>

        <div className="flex flex-col gap-4 mb-8 animate-fade-in">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services, providers or packages..."
              aria-label="Search services"
              className="pl-9 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {["All", ...SERVICE_CATEGORIES].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 hover:scale-105 ${
                  category === c
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "border-border text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="glass-card p-10 text-center animate-fade-in">
            <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No services match "{query}"</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((service, i) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="glass-card hover-lift group p-6 animate-fade-in"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${service.accent} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <service.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    {service.category}
                  </span>
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
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Services;
