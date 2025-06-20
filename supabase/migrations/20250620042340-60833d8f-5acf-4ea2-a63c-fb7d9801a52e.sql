
-- Add seller_payment_status to orders table to track payments to sellers
ALTER TABLE public.orders ADD COLUMN seller_payment_status TEXT DEFAULT 'pending';

-- Create seller_payments table to track payments made to sellers
CREATE TABLE public.seller_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  paid_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on seller_payments
ALTER TABLE public.seller_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for seller_payments
CREATE POLICY "Admins can manage seller payments" ON public.seller_payments
  FOR ALL USING (public.is_user_admin(auth.uid()));

CREATE POLICY "Sellers can view their own payments" ON public.seller_payments
  FOR SELECT USING (seller_id = auth.uid());

-- Add trigger to update updated_at column
CREATE TRIGGER update_seller_payments_updated_at
  BEFORE UPDATE ON public.seller_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
