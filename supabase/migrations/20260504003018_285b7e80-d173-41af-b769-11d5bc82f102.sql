
ALTER TABLE public.data_bundles
  ADD COLUMN IF NOT EXISTS provider_network_key TEXT,
  ADD COLUMN IF NOT EXISTS provider_capacity TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_external_reference
  ON public.orders(external_reference);
