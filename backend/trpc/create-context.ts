// backend/trpc/create-context.ts (CORRIGIDO)

import { createClient } from '@supabase/supabase-js';
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { supabase } from '../lib/supabase';

export interface Context {
  req: Request;
  user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] | null;
}

export const createContext = async (opts: FetchCreateContextFnOptions): Promise<Context> => {
  let user: Context['user'] = null;
  
  const authHeader = opts.req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // 2. Usar o cliente global para validar o token
    const { data: userData, error } = await supabase.auth.getUser(token);
    
    if (!error) {
      user = userData.user;
    }
  }

  return {
    req: opts.req,
    user: user, 
  };
};

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Não autorizado. Faça login novamente.',
    });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);

// 3. HELPER DO CLIENTE ESPECÍFICO DO USUÁRIO (MOVIDO PARA CÁ)
// (Usado por animal.ts, health.ts, descendant.ts)
export const createSupabaseClient = (ctx: Context) => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

  if (ctx.user) {
    const authHeader = ctx.req.headers.get('Authorization')!;
    const token = authHeader.split(' ')[1];
    
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  }
  // Se não houver usuário (o que não deve acontecer em 'protectedProcedure'),
  // retorna um cliente anônimo.
  return createClient(supabaseUrl, supabaseAnonKey);
};