-- Add seller profile and verification fields to public.profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS focus_area TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS certification TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS ktp_number TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS ktp_photo TEXT DEFAULT '-',
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';
