
-- Check and update payment gateway table structure if needed
-- Ensure the payment_gateways table can store all configuration details properly

-- Update RLS policies for products to ensure admins can see all products
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Users can view active products" ON public.products;

-- Create a comprehensive policy for product viewing
CREATE POLICY "Users can view products based on role and status" 
ON public.products 
FOR SELECT 
USING (
  -- Admins can see all products
  (get_user_role() = 'admin'::text) OR
  -- Sellers can see their own products (any status)
  (seller_id = auth.uid()) OR
  -- Regular users can only see active products
  (is_active = true AND get_user_role() IN ('buyer'::text, 'seller'::text))
);

-- Ensure the payment_gateways table has proper structure for storing config details
-- The table should already exist with config jsonb field, but let's make sure it's properly set up
ALTER TABLE public.payment_gateways 
ALTER COLUMN config SET DEFAULT '{}'::jsonb;

ALTER TABLE public.payment_gateways 
ALTER COLUMN fees SET DEFAULT '{"fixed": 0, "percentage": 0}'::jsonb;
