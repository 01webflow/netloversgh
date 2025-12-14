import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  user_id: string;
  package_name: string;
  data_amount: string;
  price: number;
  recipient_phone: string;
  order_status: string | null;
  payment_status: string | null;
  created_at: string | null;
}

const AdminOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (!roleLoading && !isAdmin) {
      navigate("/dashboard");
      return;
    }
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      );
      toast({
        title: "Success",
        description: "Order status updated",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.recipient_phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <div className="flex gap-4 flex-wrap">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by package or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.package_name}</TableCell>
                      <TableCell>{order.data_amount}</TableCell>
                      <TableCell>₵{order.price.toFixed(2)}</TableCell>
                      <TableCell>{order.recipient_phone}</TableCell>
                      <TableCell>{getStatusBadge(order.order_status)}</TableCell>
                      <TableCell>
                        {order.created_at
                          ? format(new Date(order.created_at), "MMM d, yyyy HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.order_status || "pending"}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                          disabled={order.order_status === "completed" || order.order_status === "failed"}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
