import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
// REMOVA os '.js' daqui também
import { appRouter } from './trpc/app-router.js';
import { createContext } from './trpc/create-context.js';

const app = new Hono();

// 1. Rota de Diagnóstico
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Hono/tRPC API is running on Vercel' });
});

// 2. Rota tRPC
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext as any,
  })
);

// 3. Rota de Debug (Catch-All) - DEVE VIR POR ÚLTIMO
app.all('*', (c) => {
    return c.json({ 
      status: 'error', 
      message: 'Route not found',
      path: c.req.path
    }, 404);
});

export default app;