// backend/trpc/app-router.ts (COMPLETO - Sem alterações)
import { createTRPCRouter } from "./create-context.js";
import { animalRouter } from "./routes/animal.js";
import { authRouter } from "./routes/auth.js";
import { descendantRouter } from "./routes/descendant.js";
import { exampleRouter } from "./routes/example.js";
import { healthRouter } from "./routes/health.js";

export const appRouter = createTRPCRouter({
  example: exampleRouter, 
  auth: authRouter,     
  animal: animalRouter, 
  health: healthRouter,     
  descendant: descendantRouter, 
});

export type AppRouter = typeof appRouter;