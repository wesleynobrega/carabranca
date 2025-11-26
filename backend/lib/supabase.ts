// backend/lib/supabase.ts (FINAL E ROBUSTO PARA VERCEL)

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variável para armazenar a instância única (Singleton)
let supabaseClient: SupabaseClient | null = null;

// Exporta uma função que cria o cliente anônimo apenas uma vez
// Isso garante que a leitura de process.env só ocorra durante o runtime da requisição.
export function getSupabaseClient(): SupabaseClient {
  // Retorna a instância existente se já tiver sido criada
  if (supabaseClient) {
    return supabaseClient;
  }

  // A leitura de process.env ocorre aqui, dentro de uma função.
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Isso gerará um erro claro se os Secrets não forem definidos corretamente na Vercel
    throw new Error('Supabase URL ou Anon Key não definidas no ambiente de execução.');
  }

  // Criação da instância ocorre apenas dentro desta função (lazy)
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}