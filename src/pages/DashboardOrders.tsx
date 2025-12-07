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
import { Menu, Search } from "lucide-react";
import { format } from "date-fns";

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
}

const DashboardOrders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredOrders = orders.filter(
    (order) =>
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipient_phone.includes(searchTerm)
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary">
        <DashboardSidebar />
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-primary text-primary-foreground p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <div>
                <h1 className="text-lg font-semibold">NAME: {user.email?.split("@")[0]}</h1>
                <p className="text-sm text-primary-foreground/70">ROLE: CUSTOMER</p>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6">
            <div className="bg-background rounded-lg shadow-sm p-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="momo">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white">
                  Bulk Actions
                </Button>
              </div>

              {/* Search */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select defaultValue="50">
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">entries</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/10">
                      <TableHead className="font-semibold">ORDER CODE</TableHead>
                      <TableHead className="font-semibold">PACKAGE</TableHead>
                      <TableHead className="font-semibold">PRICE</TableHead>
                      <TableHead className="font-semibold">BENEFICIARY NO</TableHead>
                      <TableHead className="font-semibold">VOLUME</TableHead>
                      <TableHead className="font-semibold">ORDER DATE</TableHead>
                      <TableHead className="font-semibold">ORDER STATUS</TableHead>
                      <TableHead className="font-semibold">PAYMENT METHOD</TableHead>
                      <TableHead className="font-semibold">PAYMENT STATUS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No data available in table
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>{order.package_name}</TableCell>
                          <TableCell>₵{order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.recipient_phone}</TableCell>
                          <TableCell>{order.data_amount}</TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.order_status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.order_status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </TableCell>
                          <TableCell>{order.payment_method || "-"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                order.payment_status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 0 to 0 of {filteredOrders.length} entries
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardOrders;
