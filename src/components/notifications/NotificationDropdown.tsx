import { useState, useEffect } from 'react';
import { Bell, Check, Package, Wallet, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'order' | 'wallet' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  // Fetch notifications from recent orders and transactions
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      // Get recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, package_name, order_status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id, type, amount, description, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const orderNotifications: Notification[] = (orders || []).map((order) => ({
        id: `order-${order.id}`,
        type: 'order',
        title: order.order_status === 'completed' ? 'Order Completed' : 
               order.order_status === 'processing' ? 'Order Processing' : 'Order Update',
        message: `${order.package_name} - ${order.order_status}`,
        read: order.order_status === 'completed',
        created_at: order.created_at || new Date().toISOString(),
      }));

      const transactionNotifications: Notification[] = (transactions || []).map((tx) => ({
        id: `tx-${tx.id}`,
        type: 'wallet',
        title: tx.type === 'credit' ? 'Wallet Credited' : 'Wallet Debited',
        message: `GH₵ ${tx.amount.toFixed(2)} - ${tx.description || tx.type}`,
        read: true,
        created_at: tx.created_at || new Date().toISOString(),
      }));

      const allNotifications = [...orderNotifications, ...transactionNotifications]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setNotifications(allNotifications);
    };

    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-4 w-4 text-primary" />;
      case 'wallet':
        return <Wallet className="h-4 w-4 text-accent" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-card" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
