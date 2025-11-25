// backend/lib/supabase.ts (CORRIGIDO)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou Anon Key não definidas no .env');
}

// 1. EXPORTAR O CLIENTE ANÔNIMO GLOBAL
// O auth.ts precisa disto para login/registro.
// O create-context.ts precisa disto para validar o token.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2. A FUNÇÃO 'createSupabaseClient' FOI MOVIDA
// (Ela foi movida para 'create-context.ts' para evitar dependência circular)