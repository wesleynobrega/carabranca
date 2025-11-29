// backend/trpc/routes/health.ts (CORRIGIDO)
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { HealthEvent } from '../../../types/models.js';
import { createSupabaseClient, createTRPCRouter, protectedProcedure } from '../create-context.js';
import { toCamelCase, toSnakeCase } from '../utils/casing.js';

export const healthRouter = createTRPCRouter({
  
  list: protectedProcedure
    .input(z.object({ animalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase 
        .from('health_events')
        .select('*')
        .eq('animal_id', input.animalId) 
        .order('date', { ascending: false }); 

      if (error) {
        console.error("Erro ao listar eventos de saúde:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar eventos' });
      }
      return toCamelCase(data) as HealthEvent[];
    }),

  listAll: protectedProcedure
    .query(async ({ ctx }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase
        .from('health_events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Erro ao listar todos os eventos de saúde:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao buscar eventos' });
      }
      return toCamelCase(data) as HealthEvent[]; 
    }),

  get: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { data, error } = await supabase
        .from('health_events')
        .select('*')
        .eq('id', input.eventId)
        .single();

      if (error) {
        console.error("Erro ao buscar evento de saúde:", error.message);
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Evento de saúde não encontrado' });
      }
      return toCamelCase(data) as HealthEvent;
    }),

  create: protectedProcedure
    .input(z.object({
      animalId: z.string(),
      eventType: z.enum(['vaccination', 'treatment', 'checkup', 'injury', 'other']),
      eventName: z.string(),
      date: z.string(),
      time: z.string().optional(),
      description: z.string().optional(),
      veterinarian: z.string().optional(),
      cost: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const newEventData = toSnakeCase(input);

      const { data, error } = await supabase
        .from('health_events')
        .insert(newEventData)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao criar evento de saúde:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao criar evento de saúde' });
      }
      return toCamelCase(data) as HealthEvent;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      updates: z.object({
        eventType: z.enum(['vaccination', 'treatment', 'checkup', 'injury', 'other']).optional(),
        eventName: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        description: z.string().optional(),
        veterinarian: z.string().optional(),
        cost: z.number().optional(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const updateData = toSnakeCase(input.updates);

      const { data, error } = await supabase
        .from('health_events')
        .update(updateData)
        .eq('id', input.id)
        .select()
        .single();
        
      if (error) {
        console.error("Erro ao atualizar evento de saúde:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao atualizar evento' });
      }
      return toCamelCase(data) as HealthEvent;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const supabase = createSupabaseClient(ctx);
      const { error } = await supabase
        .from('health_events')
        .delete()
        .eq('id', input.id);
        
      if (error) {
        console.error("Erro ao deletar evento de saúde:", error.message);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Falha ao deletar evento' });
      }
      return { success: true, id: input.id };
    }),
});