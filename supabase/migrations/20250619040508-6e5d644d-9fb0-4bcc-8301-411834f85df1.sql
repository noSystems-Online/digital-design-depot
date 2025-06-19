
-- Drop the existing problematic policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create a security definer function to check if a user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND 'admin' = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies that won't cause recursion
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Also fix any similar issues with the roles table policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Fix product_categories policies if they have similar issues
DROP POLICY IF EXISTS "Admins can manage categories" ON public.product_categories;

CREATE POLICY "Admins can manage categories" ON public.product_categories
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Fix site_news policies if they have similar issues  
DROP POLICY IF EXISTS "Admins can manage news" ON public.site_news;

CREATE POLICY "Admins can manage news" ON public.site_news
  FOR ALL USING (public.is_user_admin(auth.uid()));
