-- Fix the get_user_role function to properly handle admin role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin first (highest priority)
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  ) THEN
    RETURN 'admin';
  END IF;
  
  -- Check if user is seller
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND 'seller' = ANY(roles)
  ) THEN
    RETURN 'seller';
  END IF;
  
  -- Default to buyer
  RETURN 'buyer';
END;
$$;