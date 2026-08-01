import { z } from 'zod';

export const eventSchema = z.object({
  title_en: z.string().min(3, { message: 'Title (EN) must be at least 3 characters' }),
  title_ar: z.string().optional(),
  slug: z.string()
    .min(3, { message: 'Slug must be at least 3 characters' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  
  country_en: z.string().min(1, { message: 'Country (EN) is required' }),
  country_ar: z.string().optional(),
  city_en: z.string().min(1, { message: 'City (EN) is required' }),
  city_ar: z.string().optional(),
  venue_en: z.string().min(1, { message: 'Venue (EN) is required' }),
  venue_ar: z.string().optional(),

  category_id: z.string().min(1, { message: 'Category is required' }),
  seat_map_id: z.string().min(1, { message: 'Seat map is required' }),
  
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date' }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date' }),
  doors_open_time: z.string().optional(),
  
  sales_start: z.string().optional(),
  sales_end: z.string().optional(),
  
  starting_price: z.coerce.number().min(0, { message: 'Starting price cannot be negative' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  max_capacity: z.coerce.number().int().min(1, { message: 'Maximum capacity must be at least 1' }).optional().or(z.literal('')),
  
  status: z.enum(['draft', 'published', 'cancelled', 'completed']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  cover_image_url: z.string().optional(),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.start_date) <= new Date(data.end_date);
    }
    return true;
  },
  {
    message: 'End date cannot be before start date',
    path: ['end_date'],
  }
).refine(
  (data) => {
    if (data.sales_start && data.sales_end) {
      return new Date(data.sales_start) <= new Date(data.sales_end);
    }
    return true;
  },
  {
    message: 'Sales end date cannot be before sales start date',
    path: ['sales_end'],
  }
);
