import { createClient } from '@supabase/supabase-js';

// Read from Vite environment variables with project production fallback
export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://knapkvcyanxqcrnaejlz.supabase.co';

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuYXBrdmN5YW54cWNybmFlamx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MDYyMTEsImV4cCI6MjA5MTk4MjIxMX0.2fz_rOQLrgofEhwe0crc61fNOEUd4XsfrcI1Jf7DY6w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
