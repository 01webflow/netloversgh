-- 1. data_bundles admin management
CREATE POLICY "Admins can manage all bundles"
ON public.data_bundles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. audit_logs: remove permissive insert
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
REVOKE INSERT ON public.audit_logs FROM anon, authenticated;

-- 3. user_roles: block self-insert/update/delete by non-admins
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- 4. agents: prevent self-service edits of financial columns
CREATE OR REPLACE FUNCTION public.protect_agent_financials()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  NEW.commission_rate := OLD.commission_rate;
  NEW.total_sales := OLD.total_sales;
  NEW.total_commission := OLD.total_commission;
  NEW.pending_payout := OLD.pending_payout;
  NEW.status := OLD.status;
  NEW.referral_code := OLD.referral_code;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_agent_financials_trigger ON public.agents;
CREATE TRIGGER protect_agent_financials_trigger
BEFORE UPDATE ON public.agents
FOR EACH ROW EXECUTE FUNCTION public.protect_agent_financials();

-- 5. agent_payouts: validate requested amount
CREATE OR REPLACE FUNCTION public.validate_payout_amount()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pending NUMERIC; v_status agent_status;
BEGIN
  SELECT pending_payout, status INTO v_pending, v_status
  FROM public.agents WHERE id = NEW.agent_id;

  IF v_pending IS NULL THEN
    RAISE EXCEPTION 'Agent not found';
  END IF;
  IF v_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved agents can request payouts';
  END IF;
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN
    RAISE EXCEPTION 'Payout amount must be greater than zero';
  END IF;
  IF NEW.amount > v_pending THEN
    RAISE EXCEPTION 'Payout amount exceeds available balance';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_payout_amount ON public.agent_payouts;
CREATE TRIGGER check_payout_amount
BEFORE INSERT ON public.agent_payouts
FOR EACH ROW EXECUTE FUNCTION public.validate_payout_amount();

-- 6. transactions: no direct client inserts (server/service role only)
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon, authenticated;

-- 7. orders: require verified payment before completion
CREATE OR REPLACE FUNCTION public.validate_order_completion()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.order_status = 'completed' AND COALESCE(OLD.order_status, '') <> 'completed' THEN
    IF COALESCE(NEW.payment_method, '') <> 'wallet'
       AND COALESCE(NEW.payment_status, '') NOT IN ('paid', 'completed') THEN
      RAISE EXCEPTION 'Cannot complete order: payment not verified';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_completion_before_update ON public.orders;
CREATE TRIGGER validate_completion_before_update
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_completion();

-- 8. Revoke direct EXECUTE on internal functions from client roles.
-- has_role is intentionally left executable by authenticated because RLS
-- policies evaluate it as the querying role.
REVOKE EXECUTE ON FUNCTION public.enforce_order_status_flow() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_wallet_balance() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_agent_referral_code() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_order_created() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_order_updated() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_wallet_change() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_agent_commission() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_cart_item_phone() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_order_phone() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_ghana_phone(text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_agent_financials() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_payout_amount() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_order_completion() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;