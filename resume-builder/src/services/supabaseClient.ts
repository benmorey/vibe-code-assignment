import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if env vars are properly configured
let supabase = null;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  console.warn('Supabase not configured - using local storage only');
  supabase = null;
} else {
  console.log('Creating Supabase client...');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase client created successfully');
}

export { supabase };