// backend/trpc/app-router.ts (COMPLETO - Sem alterações)
import { createTRPCRouter } from "./create-context";
import { animalRouter } from "./routes/animal";
import { authRouter } from "./routes/auth";
import { descendantRouter } from "./routes/descendant";
import { exampleRouter } from "./routes/example";
import { healthRouter } from "./routes/health";

export const appRouter = createTRPCRouter({
  example: exampleRouter, 
  auth: authRouter,     
  animal: animalRouter, 
  health: healthRouter,     
  descendant: descendantRouter, 
});

export type AppRouter = typeof appRouter;