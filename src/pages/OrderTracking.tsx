import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Menu, 
  ArrowLeft, 
  Package, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Phone,
  Calendar,
  Wifi
} from "lucide-react";
import { format } from "date-fns";
import { NetworkBadge } from "@/components/dashboard/widgets/NetworkBadge";

interface Order {
  id: string;
  package_name: string;
  data_amount: string;
  price: number;
  recipient_phone: string;
  payment_method: string | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
  bundle_id: string | null;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "current" | "pending" | "failed";
  timestamp?: string;
  icon: React.ReactNode;
}

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (user && orderId) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (data) {
          setOrder(data);
        }
        setLoadingOrder(false);
      }
    };
    fetchOrder();

    // Subscribe to real-time updates
    if (orderId) {
      const channel = supabase
        .channel(`order-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            setOrder(payload.new as Order);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, orderId]);

  const getTimelineSteps = (order: Order): TimelineStep[] => {
    const orderStatus = order.order_status || "pending";
    const paymentStatus = order.payment_status || "pending";
    const isFailed = orderStatus === "failed";
    const isCompleted = orderStatus === "completed";
    const isProcessing = orderStatus === "processing";
    const isPending = orderStatus === "pending";

    const steps: TimelineStep[] = [
      {
        id: "order_placed",
        title: "Order Placed",
        description: "Your order has been received and is being reviewed",
        status: "completed",
        timestamp: order.created_at,
        icon: <Package className="h-5 w-5" />,
      },
      {
        id: "payment",
        title: "Payment " + (paymentStatus === "paid" ? "Confirmed" : paymentStatus === "failed" ? "Failed" : "Pending"),
        description: paymentStatus === "paid" 
          ? "Payment has been successfully processed" 
          : paymentStatus === "failed"
          ? "Payment could not be processed"
          : "Waiting for payment confirmation",
        status: paymentStatus === "paid" ? "completed" : paymentStatus === "failed" ? "failed" : isPending ? "current" : "pending",
        icon: <CreditCard className="h-5 w-5" />,
      },
      {
        id: "processing",
        title: "Processing",
        description: "Your data bundle is being activated",
        status: isProcessing ? "current" : isCompleted ? "completed" : isFailed && paymentStatus === "paid" ? "failed" : "pending",
        icon: <Loader2 className={`h-5 w-5 ${isProcessing ? "animate-spin" : ""}`} />,
      },
      {
        id: "completed",
        title: isFailed ? "Order Failed" : "Completed",
        description: isFailed 
          ? "Your order could not be completed. Contact support for assistance."
          : isCompleted 
          ? "Data bundle has been delivered to your phone"
          : "Data bundle will be delivered shortly",
        status: isCompleted ? "completed" : isFailed ? "failed" : "pending",
        icon: isFailed ? <XCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />,
      },
    ];

    return steps;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "current":
        return "bg-primary animate-pulse";
      case "failed":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "current":
        return "text-primary";
      case "failed":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-mesh">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!order) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background gradient-mesh">
          <DashboardSidebar />
          <SidebarInset className="flex-1">
            <main className="p-4 md:p-6 flex items-center justify-center">
              <Card className="glass-card max-w-md w-full">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    The order you're looking for doesn't exist or you don't have access to it.
                  </p>
                  <Button asChild>
                    <Link to="/dashboard/orders">View All Orders</Link>
                  </Button>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const timelineSteps = getTimelineSteps(order);

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
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/orders">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Order Tracking</h1>
                <p className="text-sm text-muted-foreground font-mono">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
            {/* Order Summary Card */}
            <Card className="glass-card animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-semibold">{order.package_name}</p>
                    <p className="text-sm text-muted-foreground">{order.data_amount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-xl font-mono-numbers">₵{order.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="font-mono">{order.recipient_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p>{format(new Date(order.created_at), "MMM d, yyyy h:mm a")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Network:</span>
                  <NetworkBadge phone={order.recipient_phone} />
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="glass-card animate-fade-in" style={{ animationDelay: "100ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Order Status Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {timelineSteps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                      {/* Vertical Line */}
                      {index < timelineSteps.length - 1 && (
                        <div 
                          className={`absolute left-[18px] top-10 w-0.5 h-[calc(100%-2.5rem)] ${
                            step.status === "completed" ? "bg-green-500" : 
                            step.status === "failed" ? "bg-destructive" : "bg-border"
                          }`}
                        />
                      )}
                      
                      {/* Icon Circle */}
                      <div 
                        className={`relative z-10 flex items-center justify-center w-9 h-9 rounded-full ${getStatusColor(step.status)} text-white shrink-0`}
                      >
                        {step.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className={`font-semibold ${getStatusTextColor(step.status)}`}>
                            {step.title}
                          </h3>
                          {step.status === "current" && (
                            <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full animate-pulse">
                              In Progress
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(step.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="glass-card animate-fade-in border-primary/20" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold mb-1">Need Help?</h3>
                    <p className="text-sm text-muted-foreground">
                      If you have any questions about your order, our support team is here to help.
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link to="/contact">Contact Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default OrderTracking;
