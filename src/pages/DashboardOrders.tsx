import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Menu, Search, RefreshCw, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { NetworkBadge } from "@/components/dashboard/widgets/NetworkBadge";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  package_name: string;
  data_amount: string;
  price: number;
  recipient_phone: string;
  payment_method: string | null;
  payment_status: string;
  order_status: string;
  created_at: string;
  bundle_id: string | null;
}

const DashboardOrders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [buyAgainLoading, setBuyAgainLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        const { data } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) {
          setOrders(data);
        }
      }
    };
    fetchOrders();
  }, [user]);

  const handleBuyAgain = async (order: Order) => {
    if (!order.bundle_id) {
      toast({
        title: "Unable to Buy Again",
        description: "Bundle information not available",
        variant: "destructive"
      });
      return;
    }

    setBuyAgainLoading(order.id);
    
    const { data: bundle } = await supabase
      .from("data_bundles")
      .select("*")
      .eq("id", order.bundle_id)
      .maybeSingle();

    if (bundle) {
      navigate("/checkout", {
        state: {
          bundle,
          recipientPhone: order.recipient_phone
        }
      });
    } else {
      toast({
        title: "Bundle Not Found",
        description: "This bundle may no longer be available",
        variant: "destructive"
      });
    }
    
    setBuyAgainLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipient_phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background gradient-mesh">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <div>
                <h1 className="text-lg font-semibold">{user.email?.split("@")[0]}</h1>
                <p className="text-sm text-muted-foreground">Order History</p>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6">
            <div className="glass-card p-6 animate-fade-in">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 glass-card border-border/50">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-card border-border/50"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-semibold">Order</TableHead>
                      <TableHead className="font-semibold">Package</TableHead>
                      <TableHead className="font-semibold">Network</TableHead>
                      <TableHead className="font-semibold">Price</TableHead>
                      <TableHead className="font-semibold">Phone</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground/50" />
                            <p className="text-muted-foreground">No orders found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order, index) => (
                        <TableRow 
                          key={order.id} 
                          className="animate-fade-in hover:bg-secondary/30"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-mono text-xs">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.package_name}</p>
                              <p className="text-xs text-muted-foreground">{order.data_amount}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <NetworkBadge phone={order.recipient_phone} />
                          </TableCell>
                          <TableCell className="font-mono-numbers font-semibold">
                            ₵{order.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {order.recipient_phone}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.order_status === "completed"
                                  ? "bg-green-500/20 text-green-600"
                                  : order.order_status === "failed"
                                  ? "bg-red-500/20 text-red-600"
                                  : order.order_status === "processing"
                                  ? "bg-blue-500/20 text-blue-600"
                                  : "bg-yellow-500/20 text-yellow-600"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.order_status === "completed" && order.bundle_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBuyAgain(order)}
                                disabled={buyAgainLoading === order.id}
                                className="hover-lift text-xs"
                              >
                                {buyAgainLoading === order.id ? (
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                ) : (
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                )}
                                Buy Again
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination info */}
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <p>Showing {filteredOrders.length} of {orders.length} orders</p>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardOrders;
