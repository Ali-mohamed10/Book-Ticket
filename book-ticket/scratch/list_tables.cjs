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

async function run() {
  const { data: seatMaps } = await supabase.from('seat_maps').select('*');
  console.log('Seat Maps:', seatMaps);
  
  const { data: tables } = await supabase
    .from('tables')
    .select('*')
    .eq('seat_map_id', '11111111-1111-1111-1111-111111111111');
  
  console.log('Tables count for gulgul-windsor:', tables.length);
  if (tables.length > 0) {
    console.log('All table codes:', tables.map(t => t.table_code).join(', '));
  }
}

run();
