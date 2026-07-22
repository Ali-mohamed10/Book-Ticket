-- ============================================================
-- Migration 002: Upgrade to scalable RBAC (Role-Based Access Control)
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Alter profiles table to add status column and update check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'editor', 'admin'));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- 2. Create is_editor_or_admin() helper function (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'editor') AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the trigger check_profile_role() function to handle RBAC column protection
CREATE OR REPLACE FUNCTION public.check_profile_role()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role TEXT;
BEGIN
  -- Get the role of the user performing the update
  SELECT role INTO current_user_role FROM public.profiles WHERE id = auth.uid();
  
  -- If role is being changed
  IF NEW.role <> OLD.role THEN
    -- Only admin (or service_role) can change roles
    IF current_user_role <> 'admin' AND COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;

  -- Only admin (or service_role) can suspend/reactivate users (change status)
  IF NEW.status <> OLD.status THEN
    IF current_user_role <> 'admin' AND COALESCE(auth.jwt()->>'role', '') <> 'service_role' THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the handle_new_user() trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer',
    'active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins and editors can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_editor_or_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Seed the initial admin account if it exists
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ali.dev400@gmail.com';
