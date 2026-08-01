import { supabase } from '../lib/supabaseClient';
import { uploadEventCover } from './imageUpload';

const BUCKET_NAME = 'event-images';

export const eventService = {
  // Fetch all events
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(name_en, name_ar, slug, icon), seat_maps(name, slug)')
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Fetch single event by id
  async getEventById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), seat_maps(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch single event by slug (includes seat map with tables for public page)
  async getEventBySlug(slug) {
    const { data, error } = await supabase
      .from('events')
      .select('*, categories(*), seat_maps(*, tables(*))')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new event
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update existing event
  async updateEvent(id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete event
  async deleteEvent(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Duplicate event
  async duplicateEvent(id) {
    // Fetch the event to duplicate
    const originalEvent = await this.getEventById(id);
    if (!originalEvent) throw new Error('Event not found');

    // Create a new payload based on the original event
    const newEventData = {
      ...originalEvent,
      id: undefined, // Let Supabase generate a new UUID
      created_at: undefined,
      updated_at: undefined,
      venues: undefined, // Remove joined data
      categories: undefined,
      seat_maps: undefined,
      title_en: `${originalEvent.title_en} (Copy)`,
      slug: `${originalEvent.slug}-copy-${Math.random().toString(36).substring(2, 7)}`,
      status: 'draft', // Duplicates should start as draft
    };
    
    // Explicitly delete undefined fields
    Object.keys(newEventData).forEach(key => newEventData[key] === undefined && delete newEventData[key]);

    const { data, error } = await supabase
      .from('events')
      .insert([newEventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload cover image
  async uploadCoverImage(file, eventId, onProgress) {
    const result = await uploadEventCover(file, eventId, onProgress);
    return result.publicUrl;
  }
};
