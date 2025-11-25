// backend/lib/supabase.ts (FINAL E ROBUSTO)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variável para armazenar a instância única (Singleton)
let supabaseClient: SupabaseClient | null = null;

// Função que cria o cliente anônimo apenas uma vez (Lazy Singleton)
export function getSupabaseClient(): SupabaseClient {
  // Retorna a instância existente se já tiver sido criada
  if (supabaseClient) {
    return supabaseClient;
  }

  // A leitura de process.env é segura aqui, pois é executada dentro de uma função
  // no runtime da Vercel.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL ou Anon Key não definidas no ambiente de execução.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}