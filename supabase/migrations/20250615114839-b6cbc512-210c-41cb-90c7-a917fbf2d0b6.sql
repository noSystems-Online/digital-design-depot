
-- Create table for PayPal configuration
CREATE TABLE public.paypal_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('sandbox', 'live')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.paypal_config ENABLE ROW LEVEL SECURITY;

-- Create policy that allows only admins to manage PayPal config
CREATE POLICY "Only admins can manage PayPal config" 
  ON public.paypal_config 
  FOR ALL 
  USING (public.get_user_role() = 'admin');

-- Add trigger to update updated_at column
CREATE TRIGGER update_paypal_config_updated_at
  BEFORE UPDATE ON public.paypal_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sandbox configuration
INSERT INTO public.paypal_config (client_id, environment, is_active)
VALUES ('ARMqjKq6xfR0awtlzCm98pTb8gGyB8A88wfgc_QcP2Yg7b6BNjuLWKYrVCFy5IvZkAqPbzUMXK_-Ap04', 'sandbox', true);
