import { AlertTriangle, CheckCircle2, Coins, ListChecks, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SERVICES } from "@/lib/services";

export interface AnalyticsOrder {
  service_type: string;
  amount: number;
  order_status: string;
}

const label = (type: string) =>
  SERVICES.find((s) => s.type === type)?.title ?? type.replace(/_/g, " ");

export function ServiceAnalytics({
  orders,
  onSelectPending,
}: {
  orders: AnalyticsOrder[];
  onSelectPending?: () => void;
}) {
  const total = orders.length;
  const completed = orders.filter((o) => o.order_status === "completed").length;
  const failed = orders.filter((o) => o.order_status === "failed").length;
  const actionable = orders.filter((o) =>
    ["pending", "processing", "dispatched"].includes(o.order_status)
  ).length;
  const revenue = orders
    .filter((o) => o.order_status === "completed")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const settled = completed + failed;
  const successRate = settled ? (completed / settled) * 100 : 0;
  const failureRate = settled ? (failed / settled) * 100 : 0;

  const byType = Array.from(
    orders.reduce((map, o) => {
      const cur = map.get(o.service_type) ?? { count: 0, value: 0, completed: 0, failed: 0 };
      cur.count += 1;
      cur.value += Number(o.amount);
      if (o.order_status === "completed") cur.completed += 1;
      if (o.order_status === "failed") cur.failed += 1;
      map.set(o.service_type, cur);
      return map;
    }, new Map<string, { count: number; value: number; completed: number; failed: number }>())
  ).sort((a, b) => b[1].count - a[1].count);

  const cards = [
    {
      title: "Total service orders",
      value: total.toString(),
      icon: <ListChecks className="h-4 w-4 text-muted-foreground" />,
      tone: "",
    },
    {
      title: "Success rate",
      value: `${successRate.toFixed(1)}%`,
      icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
      tone: "text-green-500",
    },
    {
      title: "Failure rate",
      value: `${failureRate.toFixed(1)}%`,
      icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
      tone: "text-red-500",
    },
    {
      title: "Completed revenue",
      value: `GHS ${revenue.toFixed(2)}`,
      icon: <Coins className="h-4 w-4 text-muted-foreground" />,
      tone: "text-primary",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={c.title} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              {c.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${c.tone}`}>{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Orders by service type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byType.length === 0 && (
              <p className="text-sm text-muted-foreground">No service orders yet</p>
            )}
            {byType.map(([type, stats]) => {
              const share = total ? (stats.count / total) * 100 : 0;
              const done = stats.completed + stats.failed;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium capitalize">{label(type)}</span>
                    <span className="text-muted-foreground">
                      {stats.count} · GHS {stats.value.toFixed(2)} ·{" "}
                      {done ? `${((stats.completed / done) * 100).toFixed(0)}% success` : "—"}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-700"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card
          className={`animate-fade-in ${onSelectPending ? "cursor-pointer hover:bg-muted/40 transition-colors" : ""}`}
          onClick={onSelectPending}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requires action</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{actionable}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Orders still pending, processing or dispatched
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              {["pending", "processing", "dispatched"].map((s) => (
                <div key={s} className="rounded-lg border border-border p-2 text-center">
                  <div className="font-semibold">
                    {orders.filter((o) => o.order_status === s).length}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{s}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
