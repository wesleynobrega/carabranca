import { createClient } from '@supabase/supabase-js';
import { initTRPC, TRPCError } from "@trpc/server";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import superjson from "superjson";
import { getSupabaseClient } from '../lib/supabase'; // Importa a função lazy

// Define o tipo do User para ser usado na interface Context
// 🟢 CORREÇÃO TS2339/TS2445: Obtemos o tipo do retorno da função getUser de forma segura.
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
    
    // 2. CORREÇÃO TS2339 (Runtime): Acessa a propriedade 'data' corretamente
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

// 3. HELPER DO CLIENTE ESPECÍFICO DO USUÁRIO (AJUSTADO)
export const createSupabaseClient = (ctx: Context) => {
  // ✅ CORREÇÃO TS2445/TS2339: Lê as chaves diretamente de process.env novamente.
  // Isso é o mais robusto e simples, já que a leitura dentro da função é segura.
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