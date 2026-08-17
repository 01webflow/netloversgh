GRANT INSERT ON public.transactions TO authenticated;
CREATE POLICY "Admins can create transactions"
ON public.transactions FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));