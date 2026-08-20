import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface ServiceOrder {
  id: string;
  user_id: string;
  service_type: string;
  provider: string;
  account_number: string;
  package_name: string;
  amount: number;
  payment_status: string;
  order_status: string;
  created_at: string;
}

const STATUSES = ["pending", "processing", "completed", "failed"];

const AdminServices = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
    if (!roleLoading && !isAdmin) navigate("/dashboard");
  }, [user, authLoading, isAdmin, roleLoading, navigate]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders((data as ServiceOrder[]) ?? []);
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("service_orders")
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Status updated" });
    fetchOrders();
  };

  if (!isAdmin) return null;

  const visible = filter === "all" ? orders : orders.filter((o) => o.order_status === filter);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Service Orders</h1>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-background rounded-xl border border-border p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.package_name}</TableCell>
                  <TableCell className="uppercase text-xs">{o.provider}</TableCell>
                  <TableCell>{o.account_number}</TableCell>
                  <TableCell>GHS {Number(o.amount).toFixed(2)}</TableCell>
                  <TableCell className="capitalize">{o.payment_status}</TableCell>
                  <TableCell>
                    <Select
                      value={o.order_status}
                      onValueChange={(v) => updateStatus(o.id, v)}
                    >
                      <SelectTrigger className="w-36 capitalize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(o.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No service orders
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminServices;
