import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  ShoppingCart,
  Package,
  Wallet,
  Receipt,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Wifi,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";
import { Link } from "react-router-dom";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Buy Data", url: "/bundles", icon: ShoppingCart },
  { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Account Details", url: "/dashboard/account", icon: User },
];

const orderSubItems = [
  { title: "All Orders", url: "/dashboard/orders" },
  { title: "MTN Orders", url: "/dashboard/orders/mtn" },
  { title: "AT Orders", url: "/dashboard/orders/at" },
  { title: "Telecel Orders", url: "/dashboard/orders/telecel" },
];

export function DashboardSidebar() {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [ordersOpen, setOrdersOpen] = useState(true);

  return (
    <Sidebar className="border-r border-border bg-primary text-primary-foreground">
      <SidebarHeader className="p-4 border-b border-primary-foreground/20">
        <Link to="/" className="flex items-center gap-2">
          <Wifi className="h-6 w-6" />
          {!collapsed && (
            <span className="text-xl font-semibold">
              NetLovers<span className="opacity-80">GH</span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
                      activeClassName="bg-primary-foreground/20 text-primary-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Orders Collapsible */}
              <Collapsible open={ordersOpen} onOpenChange={setOrdersOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5" />
                      {!collapsed && <span>Orders</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          ordersOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-8 mt-1 space-y-1">
                    {orderSubItems.map((item) => (
                      <NavLink
                        key={item.title}
                        to={item.url}
                        className="block px-3 py-2 text-sm rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors"
                        activeClassName="bg-primary-foreground/20 text-primary-foreground font-medium"
                      >
                        {item.title}
                      </NavLink>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-primary-foreground/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors w-full"
            >
              <LogOut className="h-5 w-5" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
