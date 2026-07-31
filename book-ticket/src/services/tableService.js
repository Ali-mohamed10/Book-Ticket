import { supabase } from '../lib/supabaseClient';

export const tableService = {
  // Fetch tables by seat map id
  async getTablesBySeatMapId(seatMapId) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('seat_map_id', seatMapId);

    if (error) throw error;
    return data;
  },

  // Bulk upsert tables (useful when saving editor changes)
  async upsertTables(tablesData) {
    const { data, error } = await supabase
      .from('tables')
      .upsert(tablesData, { onConflict: 'seat_map_id,svg_element_id' })
      .select();

    if (error) throw error;
    return data;
  },

  // Update single table status (useful for booking flow)
  async updateTableStatus(tableId, status) {
    const { data, error } = await supabase
      .from('tables')
      .update({ status })
      .eq('id', tableId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
