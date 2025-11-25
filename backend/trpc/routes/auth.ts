// backend/trpc/routes/auth.ts (VERSÃO FINAL E CORRIGIDA)
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getSupabaseClient } from '../../lib/supabase'; // ✅ NOVO IMPORT PARA O LAZY SINGLETON
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../create-context'; // Caminho Relativo

export const authRouter = createTRPCRouter({
  
  register: publicProcedure
    .input(z.object({
      fullName: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    }))
    .mutation(async ({ input }) => {
      
      const supabase = getSupabaseClient(); // ✅ Chamada Defensiva no Runtime
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
          },
        },
      });
      // ... (restante da lógica de registro)
      
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      
      const supabase = getSupabaseClient(); // ✅ Chamada Defensiva no Runtime
      
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