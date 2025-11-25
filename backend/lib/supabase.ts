// backend/lib/supabase.ts (CORRIGIDO PARA AMBIENTE SERVERLESS)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 1. Declarar a variável para armazenar a instância
let supabaseClient: SupabaseClient | null = null;

// 2. Exportar uma função que cria a instância apenas se ela ainda não existir
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  // A leitura de process.env ocorre aqui, dentro de uma função.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Agora o erro é mais descritivo e o runtime falhará propositalmente
    // se o Vercel não carregar os Secrets (o que deve funcionar)
    throw new Error('Supabase URL ou Anon Key não definidas no ambiente de execução.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

// REMOVIDO: const supabaseUrl = process.env.SUPABASE_URL!;
// REMOVIDO: export const supabase = createClient(supabaseUrl, supabaseAnonKey);