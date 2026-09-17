import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Message clair si l'app est lancée sans configuration Supabase
  // (voir .env.example)
  console.warn(
    "Configuration Supabase manquante : copie .env.example en .env et renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
