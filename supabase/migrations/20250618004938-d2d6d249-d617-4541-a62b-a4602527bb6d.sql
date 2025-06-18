
-- Create email_logs table to track sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT,
  order_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy that allows authenticated users to view email logs (admin only)
CREATE POLICY "Admins can view email logs" 
  ON public.email_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND 'admin' = ANY(roles)
    )
  );

-- Create policy that allows the system to insert email logs
CREATE POLICY "System can insert email logs" 
  ON public.email_logs 
  FOR INSERT 
  WITH CHECK (true);
