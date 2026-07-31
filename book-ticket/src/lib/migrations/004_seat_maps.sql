-- ============================================================
-- Khaleeji Tour — Seat Maps & Tables
-- ============================================================

-- Create handle_updated_at function if not exists
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create seat_maps table
CREATE TABLE IF NOT EXISTS public.seat_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  svg_url TEXT,                    -- Supabase Storage URL
  preview_image_url TEXT,          -- Supabase Storage URL
  venue_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create tables table (individual seats/tables in a map)
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_map_id UUID NOT NULL REFERENCES public.seat_maps(id) ON DELETE CASCADE,
  table_code TEXT NOT NULL,        -- e.g. "T1", "G3", "B5"
  svg_element_id TEXT NOT NULL,    -- e.g. "t_top_01" — matches SVG <g> id
  category TEXT NOT NULL DEFAULT 'standard'
    CHECK (category IN ('vip', 'gold', 'silver', 'standard')),
  capacity INTEGER NOT NULL DEFAULT 4,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'held', 'reserved', 'sold', 'disabled')),
  position_x NUMERIC,             -- for tooltip positioning
  position_y NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seat_map_id, svg_element_id)
);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_seat_maps
  BEFORE UPDATE ON public.seat_maps
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_tables
  BEFORE UPDATE ON public.tables
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.seat_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Policies for seat_maps
CREATE POLICY "Public can view active seat maps"
  ON public.seat_maps FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all seat maps"
  ON public.seat_maps FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can insert seat maps"
  ON public.seat_maps FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can update seat maps"
  ON public.seat_maps FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete seat maps"
  ON public.seat_maps FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

-- Policies for tables
CREATE POLICY "Public can view tables for active seat maps"
  ON public.tables FOR SELECT
  USING (
    seat_map_id IN (
      SELECT id FROM public.seat_maps WHERE is_active = true
    )
  );

CREATE POLICY "Admins can view all tables"
  ON public.tables FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can insert tables"
  ON public.tables FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can update tables"
  ON public.tables FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete tables"
  ON public.tables FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

-- ============================================================
-- Storage Policies for 'seat-maps' bucket
-- ============================================================

-- Create storage bucket policy to allow upload for admins/editors
DROP POLICY IF EXISTS "Allow admin/editor upload to seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor upload to seat-maps"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Create storage bucket policy to allow update for admins/editors
DROP POLICY IF EXISTS "Allow admin/editor update to seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor update to seat-maps"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Create storage bucket policy to allow delete for admins/editors
DROP POLICY IF EXISTS "Allow admin/editor delete from seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor delete from seat-maps"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

-- Create storage bucket policy to allow public select/read
DROP POLICY IF EXISTS "Allow public read from seat-maps" ON storage.objects;
CREATE POLICY "Allow public read from seat-maps"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'seat-maps');

-- Force reload schema cache
NOTIFY pgrst, 'reload schema';

