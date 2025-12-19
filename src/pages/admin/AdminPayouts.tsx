import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, CheckCircle, XCircle, Clock, Search, MoreHorizontal, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface Payout {
  id: string;
  agent_id: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_reference: string | null;
  processed_at: string | null;
  created_at: string;
  agent?: {
    business_name: string;
    phone: string;
    user_id: string;
  };
}

interface PayoutStats {
  totalPending: number;
  totalProcessed: number;
  pendingAmount: number;
  processedAmount: number;
}

const AdminPayouts = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats>({
    totalPending: 0,
    totalProcessed: 0,
    pendingAmount: 0,
    processedAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");

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

  const fetchPayouts = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from("agent_payouts")
        .select(`
          *,
          agent:agents(business_name, phone, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedData = data as unknown as Payout[];
      setPayouts(typedData);

      // Calculate stats
      const pending = typedData.filter((p) => p.status === "pending");
      const processed = typedData.filter((p) => p.status === "completed");

      setStats({
        totalPending: pending.length,
        totalProcessed: processed.length,
        pendingAmount: pending.reduce((sum, p) => sum + Number(p.amount), 0),
        processedAmount: processed.reduce((sum, p) => sum + Number(p.amount), 0),
      });
    } catch (error) {
      console.error("Error fetching payouts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPayouts();
    }
  }, [isAdmin]);

  const handlePayoutAction = async () => {
    if (!selectedPayout || !actionType) return;
    setProcessing(true);

    try {
      if (actionType === "approve") {
        // Get the agent to update their pending payout
        const { data: agentData, error: agentError } = await supabase
          .from("agents")
          .select("pending_payout, user_id")
          .eq("id", selectedPayout.agent_id)
          .single();

        if (agentError) throw agentError;

        // Update payout status
        const { error: payoutError } = await supabase
          .from("agent_payouts")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            payment_reference: paymentReference || null,
          })
          .eq("id", selectedPayout.id);

        if (payoutError) throw payoutError;

        // Update agent's pending payout
        const { error: updateError } = await supabase
          .from("agents")
          .update({
            pending_payout: Math.max(0, Number(agentData.pending_payout) - Number(selectedPayout.amount)),
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedPayout.agent_id);

        if (updateError) throw updateError;

        // Create transaction record for the agent
        const { error: transactionError } = await supabase
          .from("transactions")
          .insert({
            user_id: agentData.user_id,
            type: "payout",
            amount: selectedPayout.amount,
            description: `Agent commission payout${paymentReference ? ` - Ref: ${paymentReference}` : ""}`,
            status: "completed",
            reference: paymentReference || null,
          });

        if (transactionError) {
          console.error("Transaction recording error:", transactionError);
        }

        toast({
          title: "Success",
          description: `Payout of ₵${selectedPayout.amount.toFixed(2)} approved`,
        });
      } else {
        // Reject payout
        const { error } = await supabase
          .from("agent_payouts")
          .update({
            status: "rejected",
            processed_at: new Date().toISOString(),
          })
          .eq("id", selectedPayout.id);

        if (error) throw error;

        toast({
          title: "Payout Rejected",
          description: "The payout request has been rejected",
        });
      }

      fetchPayouts();
    } catch (error) {
      console.error("Error processing payout:", error);
      toast({
        title: "Error",
        description: "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
      setActionDialogOpen(false);
      setSelectedPayout(null);
      setActionType(null);
      setPaymentReference("");
    }
  };

  const openActionDialog = (payout: Payout, action: "approve" | "reject") => {
    setSelectedPayout(payout);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredPayouts = payouts.filter(
    (payout) =>
      payout.agent?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.agent?.phone?.includes(searchQuery) ||
      payout.payment_reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Payout Management</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">{loading ? "..." : stats.totalPending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                ₵{loading ? "..." : stats.pendingAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed Payouts</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{loading ? "..." : stats.totalProcessed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                ₵{loading ? "..." : stats.processedAmount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payouts Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <CardTitle>All Payout Requests</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by agent or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredPayouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No payout requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">
                          {payout.agent?.business_name || "Unknown"}
                        </TableCell>
                        <TableCell>{payout.agent?.phone || "N/A"}</TableCell>
                        <TableCell className="font-bold">₵{Number(payout.amount).toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{payout.payment_method}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.payment_reference ? (
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {payout.payment_reference}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {payout.status === "pending" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(payout, "approve")}
                                  className="text-green-500"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Payout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(payout, "reject")}
                                  className="text-red-500"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Payout
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Payout" : "Reject Payout"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? `Approve payout of ₵${selectedPayout?.amount.toFixed(2)} to "${selectedPayout?.agent?.business_name}"?`
                : `Are you sure you want to reject this payout request?`}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === "approve" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Reference (optional)</label>
              <Input
                placeholder="Enter transaction reference..."
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayoutAction}
              disabled={processing}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {processing
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPayouts;
