/**
 * Supabase Admin Client
 *
 * Used by serverless backend / API endpoints to execute database actions.
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('Backend warning: SUPABASE_URL environment variable missing.');
}

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

module.exports = { supabaseAdmin };
