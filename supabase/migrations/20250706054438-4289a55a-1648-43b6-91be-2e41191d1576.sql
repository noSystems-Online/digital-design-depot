-- Add demo_url field to products table
ALTER TABLE public.products 
ADD COLUMN demo_url TEXT;