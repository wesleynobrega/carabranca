// backend/trpc/routes/example.ts (CORRIGIDO)
import { z } from "zod";
// AQUI ESTÁ A CORREÇÃO:
import { createTRPCRouter, publicProcedure } from "../create-context";

export const exampleRouter = createTRPCRouter({
  hi: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return {
        hello: input.name,
        date: new Date(),
      };
    }),
});