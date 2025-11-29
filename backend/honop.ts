import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
// import { cors } from 'hono/cors'; // Mantenha comentado ou removido
import { appRouter } from './trpc/app-router.js';
import { createContext } from './trpc/create-context.js';

const app = new Hono();

// ROTA DE DIAGNÓSTICO
app.get('/', (c) => { 
  return c.json({ status: 'ok', message: 'Hono/tRPC API is running on Vercel' });
});

// Rota tRPC
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext as any,
  })
);

// ✅ ALTERAÇÃO: Exporte a instância 'app' inteira, não 'app.fetch'
export default app;