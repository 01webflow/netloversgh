import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  wallet_balance: number | null;
  created_at: string | null;
}

const AdminUsers = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    const fetchProfiles = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm)
  );

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
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.full_name || "N/A"}
                      </TableCell>
                      <TableCell>{profile.phone || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          ₵{(profile.wallet_balance || 0).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {profile.created_at
                          ? format(new Date(profile.created_at), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found
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

export default AdminUsers;
