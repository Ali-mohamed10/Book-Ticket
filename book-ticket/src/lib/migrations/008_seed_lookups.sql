-- ============================================================
-- Khaleeji Tour — Seed Categories Data
-- ============================================================

DO $$
DECLARE
    cat_concert_id UUID := gen_random_uuid();
    cat_culture_id UUID := gen_random_uuid();
    cat_heritage_id UUID := gen_random_uuid();
    cat_comedy_id UUID := gen_random_uuid();
BEGIN
    -- 1. Insert Categories
    INSERT INTO public.categories (id, name_en, name_ar, slug, icon) VALUES
    (cat_concert_id, 'Concert', 'حفلة موسيقية', 'concert', 'Music'),
    (cat_culture_id, 'Cultural Night', 'ليلة ثقافية', 'cultural-night', 'Globe'),
    (cat_heritage_id, 'Heritage Night', 'ليلة تراثية', 'heritage-night', 'Landmark'),
    (cat_comedy_id, 'Comedy Show', 'عرض كوميدي', 'comedy-show', 'Smile')
    ON CONFLICT (slug) DO NOTHING;
    
END $$;

