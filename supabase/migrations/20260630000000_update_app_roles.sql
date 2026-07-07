-- Step 1: Temporarily alter the user_roles.role column to text
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;

-- Step 2: Drop dependent functions
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);

-- Step 3: Recreate the app_role enum type with the new roles (petani, pembeli, calon_petani)
DROP TYPE IF EXISTS public.app_role;
CREATE TYPE public.app_role AS ENUM ('petani', 'pembeli', 'calon_petani');

-- Step 4: Migrate any legacy role names to the new role names in the user_roles table
UPDATE public.user_roles SET role = 'pembeli' WHERE role = 'customer';
UPDATE public.user_roles SET role = 'calon_petani' WHERE role = 'pemula';

-- Step 5: Convert column type back to public.app_role
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::public.app_role;

-- Step 6: Recreate the has_role function with the updated type signature
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;

-- Step 7: Update the handle_new_user trigger function to map meta values correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role public.app_role;
BEGIN
  -- Safe conversion from metadata string to enum
  v_role := COALESCE(
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'customer' THEN 'pembeli'::public.app_role
      WHEN NEW.raw_user_meta_data->>'role' = 'pemula' THEN 'calon_petani'::public.app_role
      WHEN NEW.raw_user_meta_data->>'role' = 'pembeli' THEN 'pembeli'::public.app_role
      WHEN NEW.raw_user_meta_data->>'role' = 'calon_petani' THEN 'calon_petani'::public.app_role
      WHEN NEW.raw_user_meta_data->>'role' = 'petani' THEN 'petani'::public.app_role
      ELSE NULLIF(NEW.raw_user_meta_data->>'role','')::public.app_role
    END,
    'pembeli'::public.app_role
  );
  INSERT INTO public.profiles (id, full_name, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone',''),
    COALESCE(NEW.raw_user_meta_data->>'address','')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
