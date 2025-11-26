import { createClient } from '@supabase/supabase-js';
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { getSupabaseClient } from '../lib/supabase.js'; // ✅ Importa a função lazy

// 1. CORREÇÃO TS2339 (Propriedade 'data'): Define o tipo do User de forma segura
type SupabaseClientInstance = ReturnType<typeof getSupabaseClient>;
type SupabaseUser = Awaited<ReturnType<SupabaseClientInstance['auth']['getUser']>>['data']['user'];

export interface Context {
  req: Request;
  user: SupabaseUser | null; 
}

export const createContext = async (opts: FetchCreateContextFnOptions): Promise<Context> => {
  let user: Context['user'] = null;
  const authHeader = opts.req.headers.get('Authorization');
  
  // ✅ O cliente anônimo é obtido aqui, garantindo que o lazy loading funcione
  const supabase = getSupabaseClient(); 

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // 2. Usar o cliente global para validar o token
    const { data: userData, error } = await supabase.auth.getUser(token);
    
    // Verifica se não houve erro e se há um objeto de usuário válido
    if (!error && userData?.user) {
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

// 3. createSupabaseClient (Para procedimentos protegidos, cria cliente com token)
export const createSupabaseClient = (ctx: Context) => {
  // ✅ CORREÇÃO TS2445/TS2339: Lê as chaves diretamente de process.env DENTRO DESTA FUNÇÃO.
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
  // Fallback (o cliente anônimo seguro)
  return getSupabaseClient();
};