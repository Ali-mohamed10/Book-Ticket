import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'seat-maps';

export const seatMapService = {
  // Fetch all seat maps
  async getSeatMaps() {
    const { data, error } = await supabase
      .from('seat_maps')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Fetch single seat map by id
  async getSeatMapById(id) {
    const { data, error } = await supabase
      .from('seat_maps')
      .select('*, tables(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Fetch single seat map by slug
  async getSeatMapBySlug(slug) {
    const { data, error } = await supabase
      .from('seat_maps')
      .select('*, tables(*)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new seat map
  async createSeatMap(seatMapData) {
    const { data, error } = await supabase
      .from('seat_maps')
      .insert([seatMapData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update existing seat map
  async updateSeatMap(id, updates) {
    const { data, error } = await supabase
      .from('seat_maps')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete seat map
  async deleteSeatMap(id) {
    const { error } = await supabase
      .from('seat_maps')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Upload file to Supabase Storage
  async uploadFile(file, path) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
