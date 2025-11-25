// backend/trpc/routes/auth.ts (CORRIGIDO)
import { TRPCError } from '@trpc/server';
import { getSupabaseClient } from 'backend/lib/supabase'; // Caminho Relativo
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../create-context'; // Caminho Relativo

export const authRouter = createTRPCRouter({
  
  register: publicProcedure
    .input(z.object({
      fullName: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    }))
    .mutation(async ({ input }) => {
      // ✅ Chamada dentro da função de execução (Lazy Loading)
      const supabase = getSupabaseClient();       
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
          },
        },
      });

      if (authError) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: authError.message });
      }
      if (!authData.user || !authData.session) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao criar usuário' });
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: input.fullName,
          email: input.email,
        });

      if (profileError) {
        console.warn("Falha ao criar perfil público, pode já existir:", profileError.message);
      }

      return {
        user: authData.user,
        token: authData.session.access_token,
      };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'E-mail ou senha inválidos' });
      }

      return {
        user: data.user,
        token: data.session.access_token,
      };
    }),
    
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});