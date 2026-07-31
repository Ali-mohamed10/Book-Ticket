-- ============================================================
-- Khaleeji Tour — Alter Events to Flat Text Venue
-- ============================================================

-- Add new columns if they do not exist
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country_en TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS country_ar TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city_en TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS city_ar TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_en TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS venue_ar TEXT;

-- Drop foreign key and old column
ALTER TABLE public.events DROP COLUMN IF EXISTS venue_id;

-- Clean up unused lookup tables
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.cities CASCADE;
DROP TABLE IF EXISTS public.countries CASCADE;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
