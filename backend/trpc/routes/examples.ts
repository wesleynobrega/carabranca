// backend/trpc/routes/example.ts
import { z } from "zod";
// Importa do novo local do create-context
import { createTRPCRouter, publicProcedure } from "@/backend/trpc/create-context.js";

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