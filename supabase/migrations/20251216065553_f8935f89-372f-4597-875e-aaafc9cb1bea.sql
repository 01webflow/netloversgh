-- Create agent_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agent_status') THEN
    CREATE TYPE public.agent_status AS ENUM ('pending', 'approved', 'suspended');
  END IF;
END$$;

-- Create agents table
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  total_sales DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_commission DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  pending_payout DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status agent_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_sales table to track individual sales
CREATE TABLE public.agent_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sale_amount DECIMAL(12,2) NOT NULL,
  commission_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agent_payouts table
CREATE TABLE public.agent_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agents
CREATE POLICY "Agents can view own profile"
ON public.agents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can apply as agent"
ON public.agents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Agents can update own profile"
ON public.agents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all agents"
ON public.agents FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_sales
CREATE POLICY "Agents can view own sales"
ON public.agent_sales FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all sales"
ON public.agent_sales FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for agent_payouts
CREATE POLICY "Agents can view own payouts"
ON public.agent_payouts FOR SELECT
USING (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Agents can request payouts"
ON public.agent_payouts FOR INSERT
WITH CHECK (agent_id IN (SELECT id FROM public.agents WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all payouts"
ON public.agent_payouts FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add agent role to app_role enum if not exists
DO $$
BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'agent';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END$$;

-- Function to calculate commission on order
CREATE OR REPLACE FUNCTION public.process_agent_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  agent_record RECORD;
BEGIN
  -- Check if the order has an agent referral (we can use metadata or separate column)
  -- For now, we'll check if the user is an agent themselves
  SELECT * INTO agent_record FROM public.agents 
  WHERE user_id = NEW.user_id AND status = 'approved';
  
  IF FOUND THEN
    -- Calculate commission
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
  
  RETURN NEW;
END;
$$;

-- Trigger for commission processing
CREATE TRIGGER on_order_completed_process_commission
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.order_status IS DISTINCT FROM NEW.order_status AND NEW.order_status = 'completed')
EXECUTE FUNCTION public.process_agent_commission();