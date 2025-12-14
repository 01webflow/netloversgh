-- Create a function to validate Ghana phone numbers
CREATE OR REPLACE FUNCTION public.validate_ghana_phone(phone text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- Ghana phone numbers: 10 digits starting with 0
  -- Allow "My Number" as a special case for self-referential orders
  IF phone = 'My Number' THEN
    RETURN true;
  END IF;
  
  -- Remove non-digit characters and validate format
  RETURN phone ~ '^0\d{9}$';
END;
$$;

-- Create a trigger function to validate phone on insert/update for orders
CREATE OR REPLACE FUNCTION public.validate_order_phone()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT public.validate_ghana_phone(NEW.recipient_phone) THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be a 10-digit Ghana phone number starting with 0.';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for orders table
CREATE TRIGGER validate_order_phone_trigger
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_phone();

-- Create a trigger function to validate phone on insert/update for cart_items
CREATE OR REPLACE FUNCTION public.validate_cart_item_phone()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- recipient_phone is nullable in cart_items, so only validate if provided
  IF NEW.recipient_phone IS NOT NULL AND NOT public.validate_ghana_phone(NEW.recipient_phone) THEN
    RAISE EXCEPTION 'Invalid phone number format. Must be a 10-digit Ghana phone number starting with 0.';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for cart_items table
CREATE TRIGGER validate_cart_item_phone_trigger
BEFORE INSERT OR UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.validate_cart_item_phone();