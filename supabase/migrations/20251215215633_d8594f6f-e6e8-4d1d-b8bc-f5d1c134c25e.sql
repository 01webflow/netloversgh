-- Fix the enforce_wallet_balance trigger to only deduct for wallet payments
CREATE OR REPLACE FUNCTION public.enforce_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  -- Only deduct if payment method is 'wallet'
  IF NEW.payment_method <> 'wallet' THEN
    RETURN NEW;
  END IF;

  SELECT wallet_balance INTO current_balance
  FROM public.profiles
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance < NEW.price THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  UPDATE public.profiles
  SET wallet_balance = wallet_balance - NEW.price
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;