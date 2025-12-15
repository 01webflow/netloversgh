import { detectNetwork, type NetworkProvider } from "@/lib/networkUtils";

interface NetworkBadgeProps {
  phone: string;
  size?: 'sm' | 'md' | 'lg';
}

export function NetworkBadge({ phone, size = 'sm' }: NetworkBadgeProps) {
  const network = detectNetwork(phone);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };
  
  const colorClasses: Record<NetworkProvider, string> = {
    MTN: 'bg-yellow-400 text-yellow-900',
    Telecel: 'bg-red-500 text-white',
    AT: 'bg-blue-500 text-white',
    Unknown: 'bg-muted text-muted-foreground'
  };

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]} ${colorClasses[network.provider]}`}>
      {network.provider}
    </span>
  );
}
