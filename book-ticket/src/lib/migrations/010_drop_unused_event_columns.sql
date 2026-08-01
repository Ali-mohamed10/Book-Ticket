-- ============================================================
-- Khaleeji Tour — Drop Unused Event Columns
-- ============================================================

-- Drop columns from public.events
ALTER TABLE public.events DROP COLUMN IF EXISTS doors_open_time;
ALTER TABLE public.events DROP COLUMN IF EXISTS sales_start;
ALTER TABLE public.events DROP COLUMN IF EXISTS sales_end;
ALTER TABLE public.events DROP COLUMN IF EXISTS max_capacity;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
