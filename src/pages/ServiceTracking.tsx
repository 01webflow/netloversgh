import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Menu,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SERVICES } from "@/lib/services";

interface ServiceOrder {
  id: string;
  service_type: string;
  provider: string;
  account_number: string;
  package_name: string;
  amount: number;
  payment_method: string | null;
  payment_status: string;
  order_status: string;
  external_reference: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

const STEP_ORDER = ["pending", "processing", "dispatched", "completed"];

const ServiceTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user || !orderId) return;
    let active = true;

    supabase
      .from("service_orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setOrder((data as unknown as ServiceOrder) ?? null);
        setLoadingOrder(false);
      });

    const channel = supabase
      .channel(`service-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "service_orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => setOrder(payload.new as unknown as ServiceOrder)
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user, orderId]);

  const service = SERVICES.find((s) => s.type === order?.service_type);
  const status = order?.order_status ?? "pending";
  const failed = status === "failed";
  const currentIndex = failed ? -1 : STEP_ORDER.indexOf(status);

  const stepState = (i: number): "completed" | "current" | "pending" | "failed" => {
    if (failed) return i === 0 ? "completed" : i === 1 ? "failed" : "pending";
    if (currentIndex < 0) return "pending";
    if (i < currentIndex) return "completed";
    if (i === currentIndex) return status === "completed" ? "completed" : "current";
    return "pending";
  };

  const steps = [
    {
      title: "Ordered",
      description: "We received your request",
      icon: <Sparkles className="h-5 w-5" />,
      timestamp: order?.created_at,
    },
    {
      title: failed ? "Processing failed" : "Processing",
      description: failed
        ? "The provider could not complete this order"
        : "Payment confirmed and the order is queued with the provider",
      icon: failed ? <XCircle className="h-5 w-5" /> : <Loader2 className="h-5 w-5" />,
      timestamp: order?.updated_at,
    },
    {
      title: "Dispatched",
      description: "Sent to the provider for delivery",
      icon: <Send className="h-5 w-5" />,
      timestamp: order?.updated_at,
    },
    {
      title: "Completed",
      description: "Delivered to your account",
      icon: <CheckCircle2 className="h-5 w-5" />,
      timestamp: order?.updated_at,
    },
  ];

  const handleRetry = () => {
    if (!order) return;
    setRetrying(true);
    const slug = (order.details as { service_slug?: string })?.service_slug ?? service?.slug;
    navigate(`/services/${slug ?? ""}`, {
      state: {
        retry: {
          provider: order.provider,
          account: order.account_number,
          amount: Number(order.amount),
          packageName: order.package_name,
        },
      },
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-secondary">
        <DashboardSidebar />
        <SidebarInset>
          <header className="h-16 flex items-center gap-4 border-b border-border bg-background px-4">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <Link
              to="/dashboard/services"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Service order</h1>
          </header>

          <main className="p-4 md:p-6 max-w-3xl">
            {loadingOrder ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !order ? (
              <div className="glass-card p-10 text-center animate-fade-in">
                <p className="text-muted-foreground mb-4">Order not found</p>
                <Link to="/dashboard/services">
                  <Button variant="outline">Back to my services</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="glass-card p-6 animate-fade-in">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold">{order.package_name}</h2>
                      <p className="text-sm text-muted-foreground uppercase">
                        {order.provider} · {order.account_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        GHS {Number(order.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <CreditCard className="h-3 w-3" />
                        {order.payment_method ?? "wallet"} · {order.payment_status}
                      </p>
                    </div>
                  </div>
                  {order.external_reference && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Reference: {order.external_reference}
                    </p>
                  )}
                </div>

                <div className="glass-card p-6 animate-fade-in">
                  <h3 className="text-sm font-medium text-muted-foreground mb-6">
                    Order timeline
                  </h3>
                  <ol className="relative">
                    {steps.map((step, i) => {
                      const state = stepState(i);
                      const color =
                        state === "completed"
                          ? "bg-green-500 text-white border-green-500"
                          : state === "current"
                          ? "bg-blue-500 text-white border-blue-500"
                          : state === "failed"
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-muted text-muted-foreground border-border";
                      return (
                        <li
                          key={step.title}
                          className="relative flex gap-4 pb-8 last:pb-0 animate-fade-in"
                          style={{ animationDelay: `${i * 120}ms` }}
                        >
                          {i < steps.length - 1 && (
                            <span
                              className={`absolute left-[19px] top-10 bottom-0 w-0.5 transition-colors duration-500 ${
                                state === "completed" ? "bg-green-500/60" : "bg-border"
                              }`}
                            />
                          )}
                          <span
                            className={`h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${color} ${
                              state === "current" ? "animate-pulse" : ""
                            }`}
                          >
                            {state === "current" && step.title === "Processing" ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              step.icon
                            )}
                          </span>
                          <div className="pt-1">
                            <p className="font-medium">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                            {state !== "pending" && step.timestamp && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(step.timestamp), "MMM d, yyyy 'at' HH:mm")}
                              </p>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                {failed && (
                  <div className="glass-card p-6 animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-4">
                      This order didn't go through. You can retry it with the same details.
                    </p>
                    <Button onClick={handleRetry} disabled={retrying} className="gap-2">
                      <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
                      Retry order
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ServiceTracking;
