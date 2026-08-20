CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  service_type text NOT NULL,
  provider text NOT NULL,
  account_number text NOT NULL,
  package_name text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  details jsonb,
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  order_status text NOT NULL DEFAULT 'pending',
  external_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service orders"
  ON public.service_orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own service orders"
  ON public.service_orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage service orders"
  ON public.service_orders FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.enforce_service_wallet_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE current_balance numeric;
BEGIN
  IF NEW.payment_method <> 'wallet' THEN
    RETURN NEW;
  END IF;

  SELECT wallet_balance INTO current_balance
  FROM public.profiles WHERE user_id = NEW.user_id FOR UPDATE;

  IF current_balance IS NULL OR current_balance < NEW.amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  UPDATE public.profiles
  SET wallet_balance = wallet_balance - NEW.amount
  WHERE user_id = NEW.user_id;

  NEW.payment_status := 'paid';
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_service_wallet_balance() FROM PUBLIC;

CREATE TRIGGER deduct_wallet_on_service_order
BEFORE INSERT ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.enforce_service_wallet_balance();

CREATE OR REPLACE FUNCTION public.log_service_order_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, entity_id, metadata)
  VALUES (NEW.user_id, 'service_order_created', 'service_orders', NEW.id,
    jsonb_build_object('service_type', NEW.service_type, 'provider', NEW.provider,
      'amount', NEW.amount, 'account_number', NEW.account_number));
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_service_order_created() FROM PUBLIC;

CREATE TRIGGER audit_service_order_created
AFTER INSERT ON public.service_orders
FOR EACH ROW EXECUTE FUNCTION public.log_service_order_created();