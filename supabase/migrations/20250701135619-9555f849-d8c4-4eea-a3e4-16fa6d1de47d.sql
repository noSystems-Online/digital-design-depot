
-- Phase 2: Enhanced Payment Processing Tables

-- Create payment_gateways table to manage different payment methods
CREATE TABLE public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'online', 'otc'
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  fees JSONB DEFAULT '{}', -- {fixed: 0, percentage: 0}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default payment gateways
INSERT INTO public.payment_gateways (name, type, config, fees) VALUES
('PayPal', 'online', '{"requires_api": true}', '{"fixed": 0.30, "percentage": 2.9}'),
('Bank Transfer', 'otc', '{"requires_verification": true}', '{"fixed": 0, "percentage": 0}'),
('7-Eleven', 'otc', '{"requires_verification": true}', '{"fixed": 15, "percentage": 0}'),
('GCash', 'online', '{"requires_api": true}', '{"fixed": 0, "percentage": 2.5}'),
('Stripe', 'online', '{"requires_api": true}', '{"fixed": 0.30, "percentage": 2.9}');

-- Create platform_settings table for dynamic configuration
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
('platform_fee_percentage', '10', 'Platform fee percentage (%)'),
('minimum_payout', '50', 'Minimum amount for seller payout ($)'),
('payout_schedule', '"weekly"', 'Payout schedule: weekly, monthly'),
('auto_approve_orders', 'false', 'Automatically approve orders for digital products'),
('require_order_verification', 'true', 'Require admin verification for OTC payments');

-- Add more fields to orders table for enhanced tracking
ALTER TABLE public.orders ADD COLUMN payment_gateway_id UUID REFERENCES public.payment_gateways(id);
ALTER TABLE public.orders ADD COLUMN payment_proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN gateway_fees NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN platform_fees NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN seller_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.orders ADD COLUMN verified_by UUID REFERENCES public.profiles(id);

-- Phase 3: Advanced Admin Controls

-- Create seller_payouts table for tracking payout batches
CREATE TABLE public.seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount NUMERIC NOT NULL,
  payout_method TEXT NOT NULL,
  payout_reference TEXT,
  status TEXT DEFAULT 'pending',
  order_ids UUID[] NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analytics_summary table for dashboard metrics
CREATE TABLE public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_revenue NUMERIC DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  gateway_fees NUMERIC DEFAULT 0,
  platform_fees NUMERIC DEFAULT 0,
  seller_payouts NUMERIC DEFAULT 0,
  active_sellers INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_gateways
CREATE POLICY "Everyone can view active payment gateways" ON public.payment_gateways
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment gateways" ON public.payment_gateways
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Create policies for platform_settings
CREATE POLICY "Admins can manage platform settings" ON public.platform_settings
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Create policies for seller_payouts
CREATE POLICY "Admins can manage seller payouts" ON public.seller_payouts
  FOR ALL USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Sellers can view their own payouts" ON public.seller_payouts
  FOR SELECT USING (seller_id = auth.uid());

-- Create policies for analytics_summary
CREATE POLICY "Admins can manage analytics" ON public.analytics_summary
  FOR ALL USING (public.is_user_admin(auth.uid()));

-- Add triggers for updated_at columns
CREATE TRIGGER update_payment_gateways_updated_at
  BEFORE UPDATE ON public.payment_gateways
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seller_payouts_updated_at
  BEFORE UPDATE ON public.seller_payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate order fees and amounts
CREATE OR REPLACE FUNCTION public.calculate_order_amounts(
  order_total NUMERIC,
  gateway_id UUID
) RETURNS TABLE(
  gateway_fee NUMERIC,
  platform_fee NUMERIC,
  seller_amount NUMERIC
) 
LANGUAGE plpgsql
AS $$
DECLARE
  gateway_fees JSONB;
  platform_fee_pct NUMERIC;
  calculated_gateway_fee NUMERIC;
  calculated_platform_fee NUMERIC;
  calculated_seller_amount NUMERIC;
BEGIN
  -- Get gateway fees
  SELECT fees INTO gateway_fees 
  FROM public.payment_gateways 
  WHERE id = gateway_id;
  
  -- Get platform fee percentage
  SELECT (value::TEXT)::NUMERIC INTO platform_fee_pct
  FROM public.platform_settings
  WHERE key = 'platform_fee_percentage';
  
  -- Calculate fees
  calculated_gateway_fee := COALESCE((gateway_fees->>'fixed')::NUMERIC, 0) + 
                           (order_total * COALESCE((gateway_fees->>'percentage')::NUMERIC, 0) / 100);
  
  calculated_platform_fee := order_total * COALESCE(platform_fee_pct, 10) / 100;
  
  calculated_seller_amount := order_total - calculated_gateway_fee - calculated_platform_fee;
  
  RETURN QUERY SELECT calculated_gateway_fee, calculated_platform_fee, calculated_seller_amount;
END;
$$;
