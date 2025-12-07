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
  { title: "Buy Data", icon: ShoppingCart, url: "/bundles", color: "bg-muted" },
  { title: "MTN AFA", icon: Signal, url: "/bundles/mtn", color: "bg-muted" },
  { title: "Talktime", icon: Phone, url: "/talktime", color: "bg-muted" },
  { title: "Info Page", icon: Info, url: "/info", color: "bg-muted" },
  { title: "Store", icon: Store, url: "/store", color: "bg-muted" },
  { title: "Wallet", icon: Wallet, url: "/dashboard/wallet", color: "bg-muted" },
  { title: "Short Codes", icon: Grid3X3, url: "/codes", color: "bg-muted" },
  { title: "FAQs", icon: HelpCircle, url: "/faq", color: "bg-muted" },
  { title: "Share App", icon: Share2, url: "/share", color: "bg-muted" },
  { title: "Profile", icon: User, url: "/dashboard/account", color: "bg-muted" },
  { title: "Update", icon: RefreshCw, url: "/update", color: "bg-muted" },
];

const QuickMenu = () => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">QUICK MENU</h3>
      <div className="grid grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm`}
            >
              <item.icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickMenu;
