-- ============================================================
-- Khaleeji Tour — Storage & RLS Policies for Seat Maps
-- Run this if you face any upload/permission errors
-- ============================================================

-- 1. Enable RLS on the tables (just to be sure)
ALTER TABLE public.seat_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- 2. Drop and Re-create Policies for seat_maps
DROP POLICY IF EXISTS "Public can view active seat maps" ON public.seat_maps;
CREATE POLICY "Public can view active seat maps"
  ON public.seat_maps FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can view all seat maps" ON public.seat_maps;
CREATE POLICY "Admins can view all seat maps"
  ON public.seat_maps FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can insert seat maps" ON public.seat_maps;
CREATE POLICY "Admins can insert seat maps"
  ON public.seat_maps FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can update seat maps" ON public.seat_maps;
CREATE POLICY "Admins can update seat maps"
  ON public.seat_maps FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can delete seat maps" ON public.seat_maps;
CREATE POLICY "Admins can delete seat maps"
  ON public.seat_maps FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

-- 3. Drop and Re-create Policies for tables
DROP POLICY IF EXISTS "Public can view tables for active seat maps" ON public.tables;
CREATE POLICY "Public can view tables for active seat maps"
  ON public.tables FOR SELECT
  USING (
    seat_map_id IN (
      SELECT id FROM public.seat_maps WHERE is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all tables" ON public.tables;
CREATE POLICY "Admins can view all tables"
  ON public.tables FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can insert tables" ON public.tables;
CREATE POLICY "Admins can insert tables"
  ON public.tables FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can update tables" ON public.tables;
CREATE POLICY "Admins can update tables"
  ON public.tables FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

DROP POLICY IF EXISTS "Admins can delete tables" ON public.tables;
CREATE POLICY "Admins can delete tables"
  ON public.tables FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'editor')
    )
  );

-- 4. Storage Policies for 'seat-maps' bucket
-- (Make sure you created a public bucket named 'seat-maps' in Supabase Storage first)

DROP POLICY IF EXISTS "Allow admin/editor upload to seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor upload to seat-maps"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow admin/editor update to seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor update to seat-maps"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow admin/editor delete from seat-maps" ON storage.objects;
CREATE POLICY "Allow admin/editor delete from seat-maps"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'seat-maps' AND 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );

DROP POLICY IF EXISTS "Allow public read from seat-maps" ON storage.objects;
CREATE POLICY "Allow public read from seat-maps"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'seat-maps');

-- Force reload schema cache
NOTIFY pgrst, 'reload schema';
