ALTER TABLE public.data_bundles
  ADD COLUMN IF NOT EXISTS provider_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS provider_product_id text,
  ADD COLUMN IF NOT EXISTS cost_price numeric;

CREATE UNIQUE INDEX IF NOT EXISTS data_bundles_provider_product_id_key
  ON public.data_bundles (provider_product_id)
  WHERE provider_product_id IS NOT NULL;