
-- Helper function to check if the current user is an admin
-- This simplifies our security policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT 'admin' = ANY(roles) FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE;

-- Change default for is_active in products table to false.
-- This ensures new products are not public until approved by an admin.
ALTER TABLE public.products ALTER COLUMN is_active SET DEFAULT false;

-- RLS for products: Grant admins full access.
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any product" ON public.products
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete any product" ON public.products
  FOR DELETE USING (is_admin());

-- RLS for profiles: Grant admins access to all user profiles.
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
