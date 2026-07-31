const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env manually
const envContent = fs.readFileSync('.env', 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    envConfig[match[1]] = value;
  }
});

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

const SEAT_MAP_ID = '11111111-1111-1111-1111-111111111111';

// Static tables matching layout image
const TABLES_DATA = [
  // 1. Top Row (Blue, capacity/price from image)
  { table_code: 'T6', category: 'standard', capacity: 2, price: 90 },
  { table_code: 'T7', category: 'standard', capacity: 4, price: 90 },
  { table_code: 'T39', category: 'standard', capacity: 4, price: 90 },
  { table_code: 'T38', category: 'standard', capacity: 2, price: 90 },

  // 2. Left Row (Gold, 6P, $100)
  { table_code: 'T5', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T4', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T3', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T2', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T1', category: 'gold', capacity: 6, price: 100 },

  // 3. Top Left Grid (Green, 4P, $110)
  { table_code: 'T8C', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T8B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T8A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T9C', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T9B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T9A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T10C', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T10B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T10A', category: 'vip', capacity: 4, price: 110 },

  // 4. Top Right Grid (Green, 4P, $110)
  { table_code: 'T37A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T37B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T37C', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T36A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T36B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T36C', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T35A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T35B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T35C', category: 'vip', capacity: 4, price: 110 },

  // 5. Center-Left Grid
  { table_code: 'T11A', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T11B', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T12A', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T12B', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T18A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T18B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T17A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T17B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T19A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T19B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T20A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T20B', category: 'vip', capacity: 4, price: 110 },

  // 6. Center-Right Grid
  { table_code: 'T24A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T24B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T23A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T23B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T25A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T25B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T26A', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T26B', category: 'vip', capacity: 4, price: 110 },
  { table_code: 'T33A', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T33B', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T32A', category: 'gold', capacity: 4, price: 100 },
  { table_code: 'T32B', category: 'gold', capacity: 4, price: 100 },

  // 7. Bottom Round Tables (Gold, 6P, $100)
  { table_code: 'T13', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T14', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T16', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T15', category: 'gold', capacity: 6, price: 100 },

  // 8. Right Round Tables (Gold, 6P, $100)
  { table_code: 'T34A', category: 'gold', capacity: 6, price: 100 },
  { table_code: 'T34B', category: 'gold', capacity: 6, price: 100 },

  // 9. High Chairs Table (Gold, 16P, $100)
  { table_code: 'High Chairs Table', category: 'gold', capacity: 16, price: 100 },

  // 10. Bottom Blue Tables (Blue, $90)
  { table_code: 'T22', category: 'standard', capacity: 6, price: 90 },
  { table_code: 'T21', category: 'standard', capacity: 3, price: 90 },
  { table_code: 'T27', category: 'standard', capacity: 2, price: 90 },
  { table_code: 'T28', category: 'standard', capacity: 2, price: 90 },
  { table_code: 'T29', category: 'standard', capacity: 4, price: 90 },
  { table_code: 'T30', category: 'standard', capacity: 4, price: 90 },
  { table_code: 'T31', category: 'standard', capacity: 7, price: 90 },
];

async function run() {
  console.log('Seeding Gulgul Windsor tables inside Supabase database...');
  
  // Format tables payload
  const payload = TABLES_DATA.map((t) => ({
    seat_map_id: SEAT_MAP_ID,
    table_code: t.table_code,
    svg_element_id: `table-${t.table_code.replace(/\s+/g, '_')}`,
    category: t.category,
    capacity: t.capacity,
    price: t.price,
    status: 'available',
  }));

  try {
    // Delete existing tables first to clear outdated seeded tables
    const { error: deleteError } = await supabase
      .from('tables')
      .delete()
      .eq('seat_map_id', SEAT_MAP_ID);

    if (deleteError) {
      console.warn('Delete warning (might not have permissions/admin role):', deleteError.message);
    } else {
      console.log('Deleted old tables successfully.');
    }

    // Upsert the 65 layout tables
    const { data, error } = await supabase
      .from('tables')
      .upsert(payload, { onConflict: 'seat_map_id,svg_element_id' })
      .select();

    if (error) {
      throw error;
    }

    console.log(`Successfully seeded ${data.length} tables in Supabase.`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    console.log('\nNOTE: If the seed failed due to Supabase RLS policies (e.g. invalid credentials or lack of admin privileges),');
    console.log('do not worry! The InteractiveSeatMap component is fully robust and automatically defaults table statuses to');
    console.log('"available" when DB records are missing. You can continue developing or run the app normally.');
  }
}

run();
