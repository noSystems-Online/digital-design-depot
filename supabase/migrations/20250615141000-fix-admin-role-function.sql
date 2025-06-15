
-- Update the get_user_role function to handle array roles properly
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  -- Check if user has admin role in their roles array
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND 'admin' = ANY(roles)
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user has seller role
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND 'seller' = ANY(roles)
  ) THEN
    RETURN 'seller';
  END IF;
  
  -- Default to buyer
  RETURN 'buyer';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Also create a simpler function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT 'admin' = ANY(roles) FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Update the policies to use the is_admin function for better performance
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
