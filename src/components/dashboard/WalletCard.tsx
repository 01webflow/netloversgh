import { PlusCircle, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WalletCardProps {
  email: string;
  balance: number;
}

const WalletCard = ({ email, balance }: WalletCardProps) => {
  const { toast } = useToast();

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    });
  };

  return (
    <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-primary-foreground/70 text-sm">User email</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-lg tracking-wider">{email}</span>
            <button
              onClick={copyEmail}
              className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        <RefreshCw className="h-8 w-8 text-primary-foreground/50 animate-spin-slow" />
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30"
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
        <div>
          <span className="text-primary-foreground/70 text-sm">BALANCE GHS:</span>
          <span className="text-2xl font-bold ml-2">{balance.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
