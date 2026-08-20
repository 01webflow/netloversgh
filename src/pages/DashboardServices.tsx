import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Menu, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";

interface ServiceOrder {
  id: string;
  service_type: string;
  provider: string;
  account_number: string;
  package_name: string;
  amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

const statusClass = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/15 text-green-600";
    case "failed":
      return "bg-red-500/15 text-red-600";
    case "processing":
      return "bg-blue-500/15 text-blue-600";
    default:
      return "bg-yellow-500/15 text-yellow-700";
  }
};

const DashboardServices = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("service_orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as ServiceOrder[]) ?? []));
  }, [user]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary">
        <DashboardSidebar />
        <SidebarInset>
          <header className="h-16 flex items-center gap-4 border-b border-border bg-background px-4">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">My Services</h1>
            <Link to="/services" className="ml-auto">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New service
              </Button>
            </Link>
          </header>

          <main className="p-4 md:p-6">
            <div className="glass-card p-4 animate-fade-in">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No service orders yet</p>
                  <Link to="/services">
                    <Button>Pay a bill</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <span className="font-medium">{o.package_name}</span>
                          <span className="block text-xs text-muted-foreground uppercase">
                            {o.provider}
                          </span>
                        </TableCell>
                        <TableCell>{o.account_number}</TableCell>
                        <TableCell>GHS {Number(o.amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusClass(
                              o.order_status
                            )}`}
                          >
                            {o.order_status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(o.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardServices;
