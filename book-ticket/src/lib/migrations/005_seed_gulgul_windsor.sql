-- ============================================================
-- Khaleeji Tour — Seed Gulgul Windsor Seat Map
-- ============================================================

-- 1. Ensure the handle_updated_at function exists (Fixes the error you faced)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Ensure tables exist (in case 004 wasn't fully executed)
CREATE TABLE IF NOT EXISTS public.seat_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  svg_url TEXT,                    
  preview_image_url TEXT,          
  venue_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seat_map_id UUID NOT NULL REFERENCES public.seat_maps(id) ON DELETE CASCADE,
  table_code TEXT NOT NULL,        
  svg_element_id TEXT NOT NULL,    
  category TEXT NOT NULL DEFAULT 'standard'
    CHECK (category IN ('vip', 'gold', 'silver', 'standard')),
  capacity INTEGER NOT NULL DEFAULT 4,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'held', 'reserved', 'sold', 'disabled')),
  position_x NUMERIC,             
  position_y NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seat_map_id, svg_element_id)
);

-- Note: We skip re-creating triggers here to avoid conflicts if they already exist.

-- 3. Insert the Data for Gulgul Windsor Map
DO $$
DECLARE
    new_map_id UUID := '11111111-1111-1111-1111-111111111111';
BEGIN
    -- Delete if exists so we can re-run safely
    DELETE FROM public.seat_maps WHERE slug = 'gulgul-windsor';
    
    INSERT INTO public.seat_maps (id, name, slug, venue_name, is_active)
    VALUES (new_map_id, 'Gulgul Windsor', 'gulgul-windsor', 'Windsor Venue', true);

    -- Insert VIP Tables (Green / Top Row) -> 110
    INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status) VALUES
    (new_map_id, 'T1', 't_top_01', 'vip', 4, 110.00, 'available'),
    (new_map_id, 'T2', 't_top_02', 'vip', 4, 110.00, 'available'),
    (new_map_id, 'T3', 't_top_03', 'vip', 4, 110.00, 'available'),
    (new_map_id, 'T4', 't_top_04', 'vip', 4, 110.00, 'available'),
    (new_map_id, 'T5', 't_top_05', 'vip', 4, 110.00, 'available'),
    (new_map_id, 'T6', 't_top_06', 'vip', 4, 110.00, 'available');

    -- Insert Gold Tables (Gold / Left & Right) -> 100
    INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status) VALUES
    (new_map_id, 'G1', 't_left_01', 'gold', 4, 100.00, 'available'),
    (new_map_id, 'G2', 't_left_02', 'gold', 4, 100.00, 'available'),
    (new_map_id, 'G3', 't_left_03', 'gold', 4, 100.00, 'available'),
    (new_map_id, 'G4', 't_right_01', 'gold', 4, 100.00, 'available'),
    (new_map_id, 'G5', 't_right_02', 'gold', 4, 100.00, 'available'),
    (new_map_id, 'G6', 't_right_03', 'gold', 4, 100.00, 'available');

    -- Insert Silver Tables (Blue / Bottom) -> 90
    INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status) VALUES
    (new_map_id, 'B1', 't_bottom_01', 'silver', 4, 90.00, 'available'),
    (new_map_id, 'B2', 't_bottom_02', 'silver', 4, 90.00, 'available'),
    (new_map_id, 'B3', 't_bottom_03', 'silver', 4, 90.00, 'available'),
    (new_map_id, 'B4', 't_bottom_04', 'silver', 4, 90.00, 'available'),
    (new_map_id, 'B5', 't_bottom_05', 'silver', 4, 90.00, 'available'),
    (new_map_id, 'B6', 't_bottom_06', 'silver', 4, 90.00, 'available');

END $$;
