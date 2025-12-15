import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Phone,
  Wallet,
  Store,
  Info,
  HelpCircle,
  Share2,
  User,
  RefreshCw,
  Grid3X3,
  Signal,
} from "lucide-react";

const menuItems = [
  { title: "Buy Data", icon: ShoppingCart, url: "/bundles", gradient: "from-primary to-accent" },
  { title: "MTN AFA", icon: Signal, url: "/bundles/mtn", gradient: "from-yellow-400 to-yellow-500" },
  { title: "Talktime", icon: Phone, url: "/talktime", gradient: "from-green-400 to-green-500" },
  { title: "Info Page", icon: Info, url: "/info", gradient: "from-blue-400 to-blue-500" },
  { title: "Store", icon: Store, url: "/store", gradient: "from-purple-400 to-purple-500" },
  { title: "Wallet", icon: Wallet, url: "/dashboard/wallet", gradient: "from-emerald-400 to-emerald-500" },
  { title: "Short Codes", icon: Grid3X3, url: "/codes", gradient: "from-orange-400 to-orange-500" },
  { title: "FAQs", icon: HelpCircle, url: "/faq", gradient: "from-pink-400 to-pink-500" },
  { title: "Share App", icon: Share2, url: "/share", gradient: "from-cyan-400 to-cyan-500" },
  { title: "Profile", icon: User, url: "/dashboard/account", gradient: "from-indigo-400 to-indigo-500" },
  { title: "Update", icon: RefreshCw, url: "/update", gradient: "from-rose-400 to-rose-500" },
];

const QuickMenu = () => {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Quick Menu</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {menuItems.map((item, index) => (
          <Link
            key={item.title}
            to={item.url}
            className="flex flex-col items-center gap-2 group animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center 
                bg-gradient-to-br ${item.gradient} 
                group-hover:scale-110 group-hover:shadow-lg transition-all duration-300
                shadow-md`}
            >
              <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <item.icon className="h-5 w-5 md:h-6 md:w-6 text-white relative z-10" />
            </div>
            <span className="text-xs text-muted-foreground text-center font-medium group-hover:text-foreground transition-colors">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickMenu;
