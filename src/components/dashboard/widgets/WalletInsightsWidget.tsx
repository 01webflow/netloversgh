import { Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  type: string;
  amount: number;
}

interface WalletInsightsWidgetProps {
  balance: number;
  recentTransactions: Transaction[];
}

export function WalletInsightsWidget({ balance, recentTransactions }: WalletInsightsWidgetProps) {
  const totalCredits = recentTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalDebits = recentTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceStatus = balance < 10 ? 'low' : balance < 50 ? 'medium' : 'healthy';
  const statusColors = {
    low: 'text-red-500',
    medium: 'text-yellow-500',
    healthy: 'text-green-500'
  };

  return (
    <div className="glass-card p-5 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Wallet Insights</h3>
        <Wallet className="h-4 w-4 text-primary" />
      </div>
      
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <p className={`text-2xl font-bold font-mono-numbers ${statusColors[balanceStatus]}`}>
            ₵{balance.toFixed(2)}
          </p>
          <span className="text-xs text-muted-foreground capitalize">{balanceStatus}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-500/10 rounded-xl p-3">
            <div className="flex items-center gap-1 text-green-500 mb-1">
              <ArrowUpRight className="h-3 w-3" />
              <span className="text-xs font-medium">Credits</span>
            </div>
            <p className="text-lg font-semibold font-mono-numbers text-green-600">
              ₵{totalCredits.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-red-500/10 rounded-xl p-3">
            <div className="flex items-center gap-1 text-red-500 mb-1">
              <ArrowDownRight className="h-3 w-3" />
              <span className="text-xs font-medium">Debits</span>
            </div>
            <p className="text-lg font-semibold font-mono-numbers text-red-600">
              ₵{totalDebits.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
