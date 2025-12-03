// backend/trpc/routes/descendant.ts (CORRIGIDO)
import { Animal, Descendant } from '@/types/models';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createSupabaseClient, createTRPCRouter, protectedProcedure } from '../create-context'; // Caminho Relativo

export const descendantRouter = createTRPCRouter({
  
  list: protectedProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      
      const { data: relations, error: relationError } = await supabase
        .from('descendants')
        .select('child_id') 
        .eq('parent_id', input.parentId);

      if (relationError) {
        console.error("Erro ao buscar relações:", relationError.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar descendentes' });
      }

      if (!relations || relations.length === 0) {
        return []; 
      }

      const childIds = relations.map(d => d.child_id);
      
      const { data: children, error: animalError } = await supabase
        .from('animals')
        .select('*')
        .in('id', childIds); 
        
      if (animalError) {
        console.error("Erro ao buscar animais filhos:", animalError.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar dados dos filhos' });
      }
      return children as Animal[];
    }),

  create: protectedProcedure
    .input(z.object({
      parentId: z.string(),
      childId: z.string(),
      relationship: z.enum(['mother', 'father']),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const newDescendantData = {
        parent_id: input.parentId,
        child_id: input.childId,
        relationship: input.relationship,
      };

      const { data, error } = await supabase
        .from('descendants')
        .insert(newDescendantData)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao criar descendente:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao criar descendente' });
      }
      return data as Descendant;
    }),
    
  listAll: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase
        .from('descendants')
        .select('child_id'); 

      if (error) {
        console.error("Erro ao listar todos os descendentes:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar dados de descendentes' });
      }
      return data.map(d => d.child_id);
    }),
});