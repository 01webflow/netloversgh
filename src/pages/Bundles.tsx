import { Link } from "react-router-dom";
import { ArrowLeft, Grid2X2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const providers = [
  {
    id: "mtn",
    name: "MTN Bundle",
    subtitle: "Swift Delivery",
    logo: "MTN",
    bgColor: "bg-yellow-400",
    textColor: "text-foreground",
  },
  {
    id: "at-bigtime",
    name: "AT Big Time Data",
    subtitle: "Normal Delivery",
    logo: "at",
    bgColor: "bg-primary",
    textColor: "text-primary-foreground",
  },
  {
    id: "at-ishare",
    name: "AT Ishare",
    subtitle: "Instant Delivery",
    logo: "at",
    bgColor: "bg-yellow-400",
    textColor: "text-foreground",
  },
  {
    id: "telecel",
    name: "Telecel",
    subtitle: "Swift Delivery",
    logo: "telecel",
    bgColor: "bg-red-500",
    textColor: "text-white",
  },
];

const deals = [
  {
    id: "mtn-deals",
    name: "MTN Deals",
    subtitle: "Yello Deals",
    logo: "MTN",
    bgColor: "bg-yellow-400",
    textColor: "text-foreground",
  },
];

const Bundles = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">INTERNET BUNDLES</h1>
          </div>
          <button className="p-2 bg-muted rounded-lg">
            <Grid2X2 className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>

        {/* Provider Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              to={`/bundles/${provider.id}`}
              className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-square flex items-center justify-center p-6">
                {provider.logo === "MTN" ? (
                  <div className="w-24 h-24 border-4 border-foreground rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">MTN</span>
                  </div>
                ) : provider.logo === "at" ? (
                  <div className="text-4xl font-bold">
                    <span className="text-red-500">a</span>
                    <span className="text-primary">t</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-red-500">telecel</span>
                )}
              </div>
              <div className={`${provider.bgColor} ${provider.textColor} p-4`}>
                <h3 className="font-semibold">{provider.name}</h3>
                <p className="text-sm opacity-80">{provider.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Super Deals Section */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Super deals</h2>
          <div className="grid grid-cols-2 gap-6">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                to={`/bundles/${deal.id}`}
                className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square flex items-center justify-center p-6">
                  <div className="w-24 h-24 border-4 border-foreground rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">MTN</span>
                  </div>
                </div>
                <div className={`${deal.bgColor} ${deal.textColor} p-4`}>
                  <h3 className="font-semibold">{deal.name}</h3>
                  <p className="text-sm opacity-80">{deal.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bundles;
