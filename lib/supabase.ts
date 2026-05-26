import { createClient } from '@supabase/supabase-js';

// Prendiamo le chiavi dal tuo file .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Esportiamo il client che useremo in tutta l'app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);