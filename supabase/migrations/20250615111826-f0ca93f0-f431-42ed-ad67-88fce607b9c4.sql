
-- Drop ALL existing policies on products table
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Users can view active products" ON public.products;
DROP POLICY IF EXISTS "Sellers can create products" ON public.products;
DROP POLICY IF EXISTS "Sellers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Sellers can delete their own products" ON public.products;

-- Drop admin policies that depend on is_admin function
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update any product" ON public.products;
DROP POLICY IF EXISTS "Admins can delete any product" ON public.products;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Now drop the is_admin function
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a security definer function to check admin role safely
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT unnest(roles) FROM public.profiles WHERE id = auth.uid() LIMIT 1),
      'buyer'
    )::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new admin policies using the security definer function
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admins can update any product" ON public.products
  FOR UPDATE USING (public.get_user_role() = 'admin') WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can delete any product" ON public.products
  FOR DELETE USING (public.get_user_role() = 'admin');

-- Create policies for regular users to view active products
CREATE POLICY "Users can view active products" ON public.products
  FOR SELECT USING (is_active = true OR seller_id = auth.uid() OR public.get_user_role() = 'admin');

-- Create policies for sellers to manage their own products
CREATE POLICY "Sellers can insert their own products" ON public.products
  FOR INSERT WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can update their own products" ON public.products
  FOR UPDATE USING (seller_id = auth.uid()) WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Sellers can delete their own products" ON public.products
  FOR DELETE USING (seller_id = auth.uid());
