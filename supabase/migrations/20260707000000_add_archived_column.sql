-- Add archived column to products table for database-level archive management
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
