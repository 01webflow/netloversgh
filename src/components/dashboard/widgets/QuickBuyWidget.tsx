import { Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { detectNetwork } from "@/lib/networkUtils";

interface LastOrder {
  id: string;
  package_name: string;
  data_amount: string;
  price: number;
  recipient_phone: string;
  bundle_id: string | null;
}

interface QuickBuyWidgetProps {
  lastOrder: LastOrder | null;
  onQuickBuy: () => void;
  isLoading?: boolean;
}

export function QuickBuyWidget({ lastOrder, onQuickBuy, isLoading }: QuickBuyWidgetProps) {
  const navigate = useNavigate();
  
  if (!lastOrder) {
    return (
      <div className="glass-card p-5 hover-lift">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Buy</h3>
          <Zap className="h-4 w-4 text-accent" />
        </div>
        
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">No recent orders</p>
          <Button 
            onClick={() => navigate('/bundles')}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Browse Bundles
          </Button>
        </div>
      </div>
    );
  }

  const network = detectNetwork(lastOrder.recipient_phone);

  return (
    <div className="glass-card p-5 hover-lift overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 gradient-primary opacity-10 blur-2xl" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Buy</h3>
          <Zap className="h-4 w-4 text-accent" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{lastOrder.package_name}</p>
              <p className="text-sm text-muted-foreground">{lastOrder.data_amount}</p>
            </div>
            <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
              network.provider === 'MTN' ? 'bg-yellow-400 text-yellow-900' :
              network.provider === 'Telecel' ? 'bg-red-500 text-white' :
              network.provider === 'AT' ? 'bg-blue-500 text-white' :
              'bg-muted text-muted-foreground'
            }`}>
              {network.provider}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>To: {lastOrder.recipient_phone}</span>
          </div>
          
          <Button 
            onClick={onQuickBuy}
            disabled={isLoading}
            className="w-full gradient-primary border-0 text-white glow-primary"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Buy Again - ₵{lastOrder.price.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
