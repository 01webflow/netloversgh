REVOKE EXECUTE ON FUNCTION public.enforce_order_status_flow() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_wallet_balance() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_agent_referral_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_order_created() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_order_updated() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_wallet_change() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_agent_commission() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_cart_item_phone() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_order_phone() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_ghana_phone(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
-- RLS policies evaluate has_role as the querying role, so signed-in users keep it
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;