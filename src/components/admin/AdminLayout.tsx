import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Users, Package, FileText, Home, Wifi, LogOut, Database, UserCheck, DollarSign, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { title: "Dashboard", href: "/admin", icon: Home },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Orders", href: "/admin/orders", icon: Package },
    { title: "Bundles", href: "/admin/bundles", icon: Database },
    { title: "Agents", href: "/admin/agents", icon: UserCheck },
    { title: "Payouts", href: "/admin/payouts", icon: DollarSign },
    { title: "Services", href: "/admin/services", icon: Sparkles },
    { title: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-xl font-semibold">
                <span className="text-primary">NetLovers</span>
                <span className="text-foreground">GH</span>
                <span className="text-muted-foreground ml-2 text-sm">Admin</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Wifi className="h-4 w-4" />
                  View Site
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-background border-r border-border min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
