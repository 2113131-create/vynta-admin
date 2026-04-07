import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const key = process.env.SUPABASE_ANON_KEY ?? '';

export const supabaseConfigured = url.length > 0 && key.length > 0;

export const supabase = supabaseConfigured
  ? createClient(url, key)
  : null;
