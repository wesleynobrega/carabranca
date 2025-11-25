import { createClient } from '@supabase/supabase-js';
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
// ✅ NOVO IMPORT: Importa a função de inicialização segura
import { getSupabaseClient } from '../lib/supabase';

// 1. CORREÇÃO TS2339 (Propriedade 'data'): 
// Define o tipo do User de forma segura, extraindo do retorno da função getUser.
type SupabaseUser = Awaited<ReturnType<ReturnType<typeof getSupabaseClient>['auth']['getUser']>>['data']['user'];

export interface Context {
  req: Request;
  user: SupabaseUser | null; 
}

export const createContext = async (opts: FetchCreateContextFnOptions): Promise<Context> => {
  let user: Context['user'] = null;
  const authHeader = opts.req.headers.get('Authorization');
  
  const supabase = getSupabaseClient(); // Obtém o cliente anônimo (seguro)

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // 2. CORREÇÃO TS2339 (Rotina): Acessa a propriedade 'data' corretamente
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

// 3. CORREÇÃO TS2445 e TS2339 (Propriedades Protegidas): 
// Lê as chaves diretamente de process.env, ignorando as propriedades protegidas.
export const createSupabaseClient = (ctx: Context) => {
  // ✅ CORREÇÃO: Lê diretamente de process.env, que é a fonte mais confiável
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
  // Retorna o cliente anônimo singleton (seguro)
  return getSupabaseClient();
};