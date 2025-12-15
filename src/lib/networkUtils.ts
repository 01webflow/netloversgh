// Ghana Network Detection Utility
// Detects network provider from phone number prefixes

export type NetworkProvider = 'MTN' | 'Telecel' | 'AT' | 'Unknown';

interface NetworkInfo {
  provider: NetworkProvider;
  color: string;
  className: string;
}

// Ghana network prefixes
const MTN_PREFIXES = ['024', '025', '053', '054', '055', '059'];
const TELECEL_PREFIXES = ['020', '050'];
const AT_PREFIXES = ['026', '027', '056', '057'];

export function detectNetwork(phone: string): NetworkInfo {
  // Clean phone number - remove spaces, dashes, and country code
  const cleaned = phone.replace(/[\s-]/g, '').replace(/^(\+233|233)/, '0');
  
  // Get the first 3 digits (prefix)
  const prefix = cleaned.substring(0, 3);
  
  if (MTN_PREFIXES.includes(prefix)) {
    return {
      provider: 'MTN',
      color: 'hsl(var(--mtn-yellow))',
      className: 'network-mtn'
    };
  }
  
  if (TELECEL_PREFIXES.includes(prefix)) {
    return {
      provider: 'Telecel',
      color: 'hsl(var(--telecel-red))',
      className: 'network-telecel'
    };
  }
  
  if (AT_PREFIXES.includes(prefix)) {
    return {
      provider: 'AT',
      color: 'hsl(var(--at-blue))',
      className: 'network-at'
    };
  }
  
  return {
    provider: 'Unknown',
    color: 'hsl(var(--muted-foreground))',
    className: 'bg-muted text-muted-foreground'
  };
}

export function getNetworkBadgeClass(provider: NetworkProvider): string {
  switch (provider) {
    case 'MTN':
      return 'bg-yellow-400 text-yellow-900 font-semibold';
    case 'Telecel':
      return 'bg-red-500 text-white font-semibold';
    case 'AT':
      return 'bg-blue-500 text-white font-semibold';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
