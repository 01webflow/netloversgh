import { Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  package_name: string;
  order_status: string;
  created_at: string;
  recipient_phone: string;
}

interface LiveOrderTrackerProps {
  recentOrders: Order[];
}

export function LiveOrderTracker({ recentOrders }: LiveOrderTrackerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 border-red-500/20';
      case 'processing':
        return 'bg-blue-500/10 border-blue-500/20';
      default:
        return 'bg-yellow-500/10 border-yellow-500/20';
    }
  };

  return (
    <div className="glass-card p-5 hover-lift">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Order Status</h3>
        <Package className="h-4 w-4 text-primary" />
      </div>
      
      {recentOrders.length === 0 ? (
        <div className="text-center py-6">
          <Package className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recent orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentOrders.slice(0, 3).map((order, index) => (
            <div 
              key={order.id} 
              className={`flex items-center gap-3 p-3 rounded-xl border ${getStatusColor(order.order_status)} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {getStatusIcon(order.order_status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{order.package_name}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM d, HH:mm')}
                </p>
              </div>
              <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                order.order_status === 'completed' ? 'bg-green-500 text-white' :
                order.order_status === 'failed' ? 'bg-red-500 text-white' :
                order.order_status === 'processing' ? 'bg-blue-500 text-white' :
                'bg-yellow-500 text-yellow-900'
              }`}>
                {order.order_status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
