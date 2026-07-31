import { supabase } from '../lib/supabaseClient';

export const lookupService = {
  // Fetch all countries
  async getCountries() {
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .order('name_en', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Fetch cities (optionally filtered by countryId)
  async getCities(countryId = null) {
    let query = supabase.from('cities').select('*').order('name_en', { ascending: true });
    
    if (countryId) {
      query = query.eq('country_id', countryId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch venues (optionally filtered by cityId)
  async getVenues(cityId = null) {
    let query = supabase.from('venues').select('*, cities(name_en, name_ar, country_id)').order('name_en', { ascending: true });
    
    if (cityId) {
      query = query.eq('city_id', cityId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Fetch all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name_en', { ascending: true });

    if (error) throw error;
    return data;
  }
};
