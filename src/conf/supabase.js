import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if keys are present
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabase;

if (isConfigured) {
    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
        console.error("Supabase initialization error:", error);
    }
} else {
    console.warn("Supabase keys missing. App will run in limited mode without database access.");
}

export { supabase, isConfigured };
