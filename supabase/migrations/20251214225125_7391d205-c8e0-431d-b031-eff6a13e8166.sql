
-- Create trigger function to log order creation
CREATE OR REPLACE FUNCTION public.log_order_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata)
  VALUES (
    NEW.user_id,
    'order_created',
    'orders',
    NEW.id,
    jsonb_build_object(
      'package_name', NEW.package_name,
      'price', NEW.price,
      'recipient_phone', NEW.recipient_phone,
      'payment_method', NEW.payment_method
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger for order creation
CREATE TRIGGER audit_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_created();

-- Create trigger function to log order updates
CREATE OR REPLACE FUNCTION public.log_order_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata)
  VALUES (
    NEW.user_id,
    'order_updated',
    'orders',
    NEW.id,
    jsonb_build_object(
      'old_status', OLD.order_status,
      'new_status', NEW.order_status,
      'old_payment_status', OLD.payment_status,
      'new_payment_status', NEW.payment_status
    )
  );
  RETURN NEW;
END;
$$;

-- Create trigger for order updates
CREATE TRIGGER audit_order_updated
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.log_order_updated();

-- Create trigger function to log wallet balance changes
CREATE OR REPLACE FUNCTION public.log_wallet_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.wallet_balance IS DISTINCT FROM NEW.wallet_balance THEN
    INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata)
    VALUES (
      NEW.user_id,
      'wallet_balance_changed',
      'profiles',
      NEW.id,
      jsonb_build_object(
        'old_balance', OLD.wallet_balance,
        'new_balance', NEW.wallet_balance,
        'change', NEW.wallet_balance - COALESCE(OLD.wallet_balance, 0)
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for wallet changes
CREATE TRIGGER audit_wallet_change
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_wallet_change();

-- Add admin policy for profiles (view all)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policy for transactions (view all)
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
