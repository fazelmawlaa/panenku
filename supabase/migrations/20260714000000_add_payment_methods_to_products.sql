-- Add payment_methods column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS payment_methods TEXT DEFAULT 'ewallet,va,card,cod';
