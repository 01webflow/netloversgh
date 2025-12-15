import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface UsageSummaryWidgetProps {
  currentMonth: number;
  previousMonth: number;
  totalOrders: number;
}

export function UsageSummaryWidget({ currentMonth, previousMonth, totalOrders }: UsageSummaryWidgetProps) {
  const percentChange = previousMonth > 0 
    ? ((currentMonth - previousMonth) / previousMonth) * 100 
    : 0;
  
  const TrendIcon = percentChange > 0 
    ? TrendingUp 
    : percentChange < 0 
    ? TrendingDown 
    : Minus;
  
  const trendColor = percentChange > 0 
    ? "text-green-500" 
    : percentChange < 0 
    ? "text-red-500" 
    : "text-muted-foreground";

  return (
    <div className="glass-card p-5 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Monthly Usage</h3>
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{Math.abs(percentChange).toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-2xl font-bold font-mono-numbers">
            ₵{currentMonth.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">spent this month</p>
        </div>
        
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary rounded-full transition-all duration-500"
            style={{ width: `${Math.min((currentMonth / (previousMonth || 1)) * 100, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Last month: ₵{previousMonth.toFixed(2)}</span>
          <span>{totalOrders} orders</span>
        </div>
      </div>
    </div>
  );
}
