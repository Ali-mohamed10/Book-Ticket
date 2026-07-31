-- ============================================================
-- Khaleeji Tour — Seed Tables Data for Gulgul Windsor Map
-- ============================================================

-- Clean up existing tables for Gulgul Windsor seat map (ID matches the DB record)
DELETE FROM public.tables WHERE seat_map_id = '29889aa2-620f-4546-ab34-7c92bda26575';

-- Insert VIP tables (Green, capacity: 6, price: $250.00)
INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status, position_x, position_y) VALUES
('29889aa2-620f-4546-ab34-7c92bda26575', 'T1', 't_top_01', 'vip', 6, 250.00, 'available', 400.00, 170.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'T2', 't_top_02', 'vip', 6, 250.00, 'available', 500.00, 170.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'T3', 't_top_03', 'vip', 6, 250.00, 'available', 600.00, 170.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'T4', 't_top_04', 'vip', 6, 250.00, 'available', 700.00, 170.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'T5', 't_top_05', 'vip', 6, 250.00, 'available', 800.00, 170.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'T6', 't_top_06', 'vip', 6, 250.00, 'available', 900.00, 170.00);

-- Insert Gold tables (Gold/Yellow, capacity: 4, price: $150.00)
INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status, position_x, position_y) VALUES
('29889aa2-620f-4546-ab34-7c92bda26575', 'G1', 't_left_01', 'gold', 4, 150.00, 'available', 360.00, 240.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'G2', 't_left_02', 'gold', 4, 150.00, 'available', 360.00, 330.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'G3', 't_left_03', 'gold', 4, 150.00, 'available', 360.00, 420.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'G4', 't_right_01', 'gold', 4, 150.00, 'available', 1040.00, 240.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'G5', 't_right_02', 'gold', 4, 150.00, 'available', 1040.00, 330.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'G6', 't_right_03', 'gold', 4, 150.00, 'available', 1040.00, 420.00);

-- Insert Standard tables (Blue, capacity: 4, price: $100.00)
INSERT INTO public.tables (seat_map_id, table_code, svg_element_id, category, capacity, price, status, position_x, position_y) VALUES
('29889aa2-620f-4546-ab34-7c92bda26575', 'B1', 't_bottom_01', 'standard', 4, 100.00, 'available', 400.00, 400.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'B2', 't_bottom_02', 'standard', 4, 100.00, 'available', 500.00, 400.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'B3', 't_bottom_03', 'standard', 4, 100.00, 'available', 600.00, 400.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'B4', 't_bottom_04', 'standard', 4, 100.00, 'available', 700.00, 400.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'B5', 't_bottom_05', 'standard', 4, 100.00, 'available', 800.00, 400.00),
('29889aa2-620f-4546-ab34-7c92bda26575', 'B6', 't_bottom_06', 'standard', 4, 100.00, 'available', 900.00, 400.00);
