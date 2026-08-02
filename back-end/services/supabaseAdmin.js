/**
 * Supabase Admin Client (Service Role)
 *
 * Used exclusively by serverless backend / API endpoints to execute privileged database actions
 * (such as confirming payments, generating tickets, and managing row locks).
 */
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn('Backend warning: SUPABASE_URL environment variable missing.');
}

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

module.exports = { supabaseAdmin };
