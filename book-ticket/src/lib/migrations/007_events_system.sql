-- ============================================================
-- Khaleeji Tour — Events System Database Schema (Flat Text Venue Version)
-- ============================================================

-- 1. Create Lookup Tables (Only Categories remains)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT NOT NULL,
  title_ar TEXT,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  cover_image_url TEXT,
  
  -- Flat text location fields
  country_en TEXT NOT NULL,
  country_ar TEXT,
  city_en TEXT NOT NULL,
  city_ar TEXT,
  venue_en TEXT NOT NULL,
  venue_ar TEXT,

  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  seat_map_id UUID REFERENCES public.seat_maps(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  doors_open_time TIME,
  starting_price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  max_capacity INTEGER,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Triggers for updated_at
CREATE TRIGGER handle_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Public Read Access
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view published events" ON public.events FOR SELECT USING (status = 'published');

-- Admin Full Access (using the is_editor_or_admin function from 001_profiles.sql)
CREATE POLICY "Admins can manage categories" ON public.categories USING (public.is_editor_or_admin());
CREATE POLICY "Admins can manage all events" ON public.events USING (public.is_editor_or_admin());

-- 6. Storage Bucket for Event Images
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Allow admin/editor upload to event-images" ON storage.objects;
CREATE POLICY "Allow admin/editor upload to event-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow admin/editor update to event-images" ON storage.objects;
CREATE POLICY "Allow admin/editor update to event-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow admin/editor delete from event-images" ON storage.objects;
CREATE POLICY "Allow admin/editor delete from event-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-images' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow public read from event-images" ON storage.objects;
CREATE POLICY "Allow public read from event-images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-images');

-- Force reload schema cache
NOTIFY pgrst, 'reload schema';

