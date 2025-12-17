-- Add notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_preference TEXT DEFAULT 'email' 
CHECK (notification_preference IN ('email', 'whatsapp', 'both', 'none'));

-- Add referral code to agents
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add referred_by_agent_id to orders for tracking referrals
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS referred_by_agent_id UUID REFERENCES public.agents(id);

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_agent_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate referral code on agent creation
DROP TRIGGER IF EXISTS generate_referral_code ON public.agents;
CREATE TRIGGER generate_referral_code
  BEFORE INSERT ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_agent_referral_code();

-- Update existing agents with referral codes
UPDATE public.agents 
SET referral_code = UPPER(SUBSTRING(MD5(id::text || NOW()::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Update process_agent_commission to handle referrals
CREATE OR REPLACE FUNCTION public.process_agent_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_record RECORD;
BEGIN
  -- Only process on completed orders
  IF NEW.order_status <> 'completed' THEN
    RETURN NEW;
  END IF;
  
  -- Check if order was referred by an agent
  IF NEW.referred_by_agent_id IS NOT NULL THEN
    SELECT * INTO agent_record FROM public.agents 
    WHERE id = NEW.referred_by_agent_id AND status = 'approved';
    
    IF FOUND THEN
      -- Check if commission already recorded for this order
      IF NOT EXISTS (SELECT 1 FROM public.agent_sales WHERE order_id = NEW.id) THEN
        -- Record the sale
        INSERT INTO public.agent_sales (agent_id, order_id, sale_amount, commission_amount, status)
        VALUES (
          agent_record.id,
          NEW.id,
          NEW.price,
          NEW.price * (agent_record.commission_rate / 100),
          'completed'
        );
        
        -- Update agent totals
        UPDATE public.agents
        SET 
          total_sales = total_sales + NEW.price,
          total_commission = total_commission + (NEW.price * (commission_rate / 100)),
          pending_payout = pending_payout + (NEW.price * (commission_rate / 100)),
          updated_at = now()
        WHERE id = agent_record.id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for commission processing on order updates
DROP TRIGGER IF EXISTS on_order_completed_process_commission ON public.orders;
CREATE TRIGGER on_order_completed_process_commission
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  WHEN (OLD.order_status IS DISTINCT FROM NEW.order_status AND NEW.order_status = 'completed')
  EXECUTE FUNCTION public.process_agent_commission();