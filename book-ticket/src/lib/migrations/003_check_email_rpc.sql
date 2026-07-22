-- ============================================================
-- Khaleeji Tour — Check Email Existence RPC
-- Run this in Supabase SQL Editor
-- Purpose: Bypasses RLS to allow the frontend to check if an email
-- is registered to provide better login error messages.
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_email_exists(lookup_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE email = lookup_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
