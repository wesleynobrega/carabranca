// backend/trpc/routes/animal.ts (CORRIGIDO)
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Animal } from '../../../types/models.js';
import { createSupabaseClient, createTRPCRouter, protectedProcedure } from '../create-context.js';
import { toCamelCase, toSnakeCase } from '../utils/casing.js';

export const animalRouter = createTRPCRouter({
  
  create: protectedProcedure
    .input(
      z.object({
        tagId: z.string(),
        name: z.string().optional(),
        type: z.enum(['cow', 'calf', 'bull', 'heifer', 'steer']),
        gender: z.enum(['M', 'F']),
        dateOfBirth: z.string(), 
        breed: z.string().optional(),
        color: z.string().optional(),
        weight: z.number().optional(),
        status: z.enum(['active', 'sold', 'deceased', 'for_sale']),
        imageUri: z.string().optional(),
        motherId: z.string().optional(),
        fatherId: z.string().optional(),
        observations: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const newAnimalData = toSnakeCase(input);

      const { data, error } = await supabase
        .from('animals')
        .insert({ ...newAnimalData, user_id: ctx.user.id })
        .select() 
        .single(); 

      if (error) {
        console.error("Erro ao criar animal:", error.message, error.details);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Falha ao criar animal: ${error.message}` });
      }
      return toCamelCase(data) as Animal;
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Erro ao listar animais:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar animais' });
      }
      return toCamelCase(data) as Animal[];
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('id', input.id)
        .single();
      
      if (error) {
        console.error("Erro ao buscar animal:", error.message);
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Animal não encontrado' });
      }
      return toCamelCase(data) as Animal;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(), 
        updates: z.object({
          tagId: z.string().optional(),
          name: z.string().optional(),
          type: z.enum(['cow', 'calf', 'bull', 'heifer', 'steer']).optional(),
          gender: z.enum(['M', 'F']).optional(),
          dateOfBirth: z.string().optional(),
          breed: z.string().optional(),
          color: z.string().optional(),
          weight: z.number().optional(),
          status: z.enum(['active', 'sold', 'deceased', 'for_sale']).optional(),
          imageUri: z.string().optional(),
          motherId: z.string().optional(),
          fatherId: z.string().optional(),
          observations: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { id, updates } = input;
      
      const updateData = toSnakeCase(updates);
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('animals')
        .update(updateData) 
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Erro ao atualizar animal:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao atualizar animal' });
      }
      return toCamelCase(data) as Animal;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { error } = await supabase
        .from('animals')
        .delete()
        .eq('id', input.id);
        
      if (error) {
        console.error("Erro ao deletar animal:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao deletar animal' });
      }
      return { success: true, id: input.id };
    }),
});