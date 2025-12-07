import { Link } from "react-router-dom";
import { Wifi } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">
              <span className="text-primary">Netgear</span>
              <span className="text-foreground"> GH</span>
            </span>
          </Link>
          
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} NetGear GH. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
