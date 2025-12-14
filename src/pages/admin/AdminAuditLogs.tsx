import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  metadata: unknown;
  created_at: string | null;
}

const AdminAuditLogs = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
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

  const fetchLogs = async () => {
    if (!isAdmin) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching audit logs:", error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  const getActionBadge = (action: string) => {
    if (action.includes("created")) {
      return <Badge className="bg-green-500">{action}</Badge>;
    }
    if (action.includes("updated") || action.includes("changed")) {
      return <Badge className="bg-blue-500">{action}</Badge>;
    }
    if (action.includes("deleted") || action.includes("failed")) {
      return <Badge variant="destructive">{action}</Badge>;
    }
    return <Badge variant="outline">{action}</Badge>;
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchTerm.toLowerCase())
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          </div>
          <Button onClick={fetchLogs} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by action or entity..."
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
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-medium">{log.entity}</TableCell>
                      <TableCell className="max-w-xs">
                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                          {log.metadata ? JSON.stringify(log.metadata, null, 2) : "N/A"}
                        </pre>
                      </TableCell>
                      <TableCell>
                        {log.created_at
                          ? format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No audit logs found
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

export default AdminAuditLogs;
