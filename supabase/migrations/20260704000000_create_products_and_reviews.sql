-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL, -- 'preorder' | 'ready' | 'waste' | 'tools'
  farmer TEXT NOT NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  stock NUMERIC NOT NULL,
  ordered NUMERIC DEFAULT 0,
  estimated_harvest TEXT,
  cultivation TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Products are selectable by anyone" ON public.products;
DROP POLICY IF EXISTS "Products are insertable by authenticated users" ON public.products;
DROP POLICY IF EXISTS "Products are updatable by owner" ON public.products;
DROP POLICY IF EXISTS "Products are deletable by owner" ON public.products;

-- Create products policies
CREATE POLICY "Products are selectable by anyone" ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Products are insertable by authenticated users" ON public.products FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Products are updatable by owner" ON public.products FOR UPDATE TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Products are deletable by owner" ON public.products FOR DELETE TO authenticated USING (auth.uid() = farmer_id);

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Reviews are selectable by anyone" ON public.product_reviews;
DROP POLICY IF EXISTS "Reviews are insertable by authenticated users" ON public.product_reviews;

-- Create reviews policies
CREATE POLICY "Reviews are selectable by anyone" ON public.product_reviews FOR SELECT TO public USING (true);
CREATE POLICY "Reviews are insertable by authenticated users" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO public, authenticated;
GRANT SELECT, INSERT ON public.product_reviews TO public, authenticated;
