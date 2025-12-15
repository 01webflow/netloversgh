import { PlusCircle, Copy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface WalletCardProps {
  email: string;
  balance: number;
}

const WalletCard = ({ email, balance }: WalletCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    });
  };

  const balanceStatus = balance < 10 ? 'low' : balance < 50 ? 'medium' : 'healthy';

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />
      
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
      
      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Account</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm opacity-90">{email}</span>
              <button
                onClick={copyEmail}
                className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-mono-numbers tracking-tight">
              ₵{balance.toFixed(2)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              balanceStatus === 'low' ? 'bg-red-500/30 text-red-200' :
              balanceStatus === 'medium' ? 'bg-yellow-500/30 text-yellow-200' :
              'bg-green-500/30 text-green-200'
            }`}>
              {balanceStatus === 'low' ? 'Low' : balanceStatus === 'medium' ? 'Fair' : 'Good'}
            </span>
          </div>
        </div>
        
        <Button
          onClick={() => navigate('/dashboard/wallet')}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Fund Wallet
        </Button>
      </div>
    </div>
  );
};

export default WalletCard;
