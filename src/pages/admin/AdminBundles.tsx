import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Pencil, ToggleLeft, ToggleRight, Search } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";

interface Bundle {
  id: string;
  name: string;
  provider: string;
  data_amount: string;
  price: number;
  delivery_type: string | null;
  is_active: boolean | null;
  created_at: string | null;
  provider_network_key: string | null;
  provider_capacity: string | null;
}

const NETWORK_KEY_OPTIONS = [
  { value: "YELLO", label: "MTN (YELLO)" },
  { value: "TELECEL", label: "Telecel (TELECEL)" },
  { value: "AT_PREMIUM", label: "AirtelTigo iShare (AT_PREMIUM)" },
  { value: "AT_BIGTIME", label: "AirtelTigo BigTime (AT_BIGTIME)" },
];

const AdminBundles = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [processing, setProcessing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    provider: "MTN",
    data_amount: "",
    price: "",
    delivery_type: "instant",
    provider_network_key: "YELLO",
    provider_capacity: "",
  });

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

  const fetchBundles = async () => {
    const { data, error } = await supabase
      .from("data_bundles")
      .select("*")
      .order("provider")
      .order("price");

    if (error) {
      console.error("Error fetching bundles:", error);
    } else {
      setBundles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBundles();
    }
  }, [isAdmin]);

  const openCreateDialog = () => {
    setEditingBundle(null);
    setFormData({
      name: "",
      provider: "MTN",
      data_amount: "",
      price: "",
      delivery_type: "instant",
      provider_network_key: "YELLO",
      provider_capacity: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (bundle: Bundle) => {
    setEditingBundle(bundle);
    setFormData({
      name: bundle.name,
      provider: bundle.provider,
      data_amount: bundle.data_amount,
      price: bundle.price.toString(),
      delivery_type: bundle.delivery_type || "instant",
      provider_network_key: bundle.provider_network_key || "YELLO",
      provider_capacity: bundle.provider_capacity || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.data_amount || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const payload = {
        name: formData.name,
        provider: formData.provider,
        data_amount: formData.data_amount,
        price: parseFloat(formData.price),
        delivery_type: formData.delivery_type,
        provider_network_key: formData.provider_network_key,
        provider_capacity: formData.provider_capacity || null,
      };

      if (editingBundle) {
        const { error } = await supabase
          .from("data_bundles")
          .update(payload)
          .eq("id", editingBundle.id);
        if (error) throw error;
        toast({ title: "Success", description: "Bundle updated successfully" });
      } else {
        const { error } = await supabase
          .from("data_bundles")
          .insert({ ...payload, is_active: true });
        if (error) throw error;
        toast({ title: "Success", description: "Bundle created successfully" });
      }

      fetchBundles();
      setDialogOpen(false);
    } catch (error: unknown) {
      console.error("Error saving bundle:", error);
      toast({
        title: "Error",
        description: "Failed to save bundle",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleBundleStatus = async (bundle: Bundle) => {
    const newStatus = !bundle.is_active;

    const { error } = await supabase
      .from("data_bundles")
      .update({ is_active: newStatus })
      .eq("id", bundle.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update bundle status",
        variant: "destructive",
      });
    } else {
      setBundles((prev) =>
        prev.map((b) => (b.id === bundle.id ? { ...b, is_active: newStatus } : b))
      );
      toast({
        title: "Success",
        description: `Bundle ${newStatus ? "activated" : "deactivated"}`,
      });
    }
  };

  const filteredBundles = bundles.filter((bundle) => {
    const matchesSearch =
      bundle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bundle.data_amount.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider = providerFilter === "all" || bundle.provider === providerFilter;
    return matchesSearch && matchesProvider;
  });

  const providers = [...new Set(bundles.map((b) => b.provider))];

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Bundle Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSyncCatalog} disabled={syncing}>
              {syncing ? "Syncing…" : "Sync Datasika Catalog"}
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" /> Add Bundle
            </Button>
          </div>

        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <CardTitle>All Bundles ({filteredBundles.length})</CardTitle>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bundles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={providerFilter} onValueChange={setProviderFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Data Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </TableCell>
                    </TableRow>
                  ) : filteredBundles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bundles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBundles.map((bundle) => (
                      <TableRow key={bundle.id}>
                        <TableCell className="font-medium">{bundle.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{bundle.provider}</Badge>
                        </TableCell>
                        <TableCell>{bundle.data_amount}</TableCell>
                        <TableCell>₵{bundle.price.toFixed(2)}</TableCell>
                        <TableCell className="capitalize">{bundle.delivery_type}</TableCell>
                        <TableCell>
                          {bundle.is_active ? (
                            <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                          ) : (
                            <Badge className="bg-red-500/10 text-red-500">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(bundle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBundleStatus(bundle)}
                            >
                              {bundle.is_active ? (
                                <ToggleRight className="h-5 w-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBundle ? "Edit Bundle" : "Create New Bundle"}</DialogTitle>
            <DialogDescription>
              {editingBundle ? "Update the bundle details below" : "Fill in the details to create a new data bundle"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., MTN 2GB Daily"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN</SelectItem>
                    <SelectItem value="AirtelTigo">AirtelTigo</SelectItem>
                    <SelectItem value="Telecel">Telecel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_amount">Data Amount</Label>
                <Input
                  id="data_amount"
                  value={formData.data_amount}
                  onChange={(e) => setFormData({ ...formData, data_amount: e.target.value })}
                  placeholder="e.g., 2GB"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (GHS)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 10.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery_type">Delivery Type</Label>
                <Select
                  value={formData.delivery_type}
                  onValueChange={(value) => setFormData({ ...formData, delivery_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant</SelectItem>
                    <SelectItem value="midnight">Midnight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
              <div className="text-sm font-semibold">DataHub Provider Mapping</div>
              <p className="text-xs text-muted-foreground">
                Used to fulfill orders automatically via DataHub Ghana API.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="provider_network_key">Network Key</Label>
                  <Select
                    value={formData.provider_network_key}
                    onValueChange={(value) => setFormData({ ...formData, provider_network_key: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NETWORK_KEY_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider_capacity">Capacity (GB)</Label>
                  <Input
                    id="provider_capacity"
                    value={formData.provider_capacity}
                    onChange={(e) => setFormData({ ...formData, provider_capacity: e.target.value })}
                    placeholder="e.g., 1, 2, 5"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={processing}>
              {processing ? "Saving..." : editingBundle ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBundles;
