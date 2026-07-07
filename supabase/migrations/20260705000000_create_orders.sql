-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, -- ORD-XXXX
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  qty TEXT NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL, -- 'Menunggu', 'Dibayar', 'Diproses', 'Sedang Panen', 'Pengiriman', 'Selesai'
  date TEXT NOT NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shipping_address TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Orders are selectable by buyer or seller" ON public.orders;
DROP POLICY IF EXISTS "Orders are insertable by authenticated buyers" ON public.orders;
DROP POLICY IF EXISTS "Orders are updatable by buyer or seller" ON public.orders;

-- Create policies
CREATE POLICY "Orders are selectable by buyer or seller" ON public.orders FOR SELECT TO authenticated USING (
  auth.uid() = user_id OR auth.uid() = farmer_id
);

CREATE POLICY "Orders are insertable by authenticated buyers" ON public.orders FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Orders are updatable by buyer or seller" ON public.orders FOR UPDATE TO authenticated USING (
  auth.uid() = user_id OR auth.uid() = farmer_id
) WITH CHECK (
  auth.uid() = user_id OR auth.uid() = farmer_id
);

-- Grant privileges
GRANT SELECT, INSERT, UPDATE ON public.orders TO public, authenticated;
