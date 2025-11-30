import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
// import { cors } from 'hono/cors'; // Mantenha removido/comentado para Vercel
import { appRouter } from './trpc/app-router.js';
import { createContext } from './trpc/create-context.js';

const app = new Hono();

// 1. Rota de Diagnóstico (Health Check)
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Hono/tRPC API is running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// 2. Rota tRPC
// O prefixo deve ser '/api/trpc' para bater com a URL que o Vercel envia
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext as any,
  })
);

// 3. Rota de Debug (Catch-All)
// Útil para saber se a requisição chegou mas a rota estava errada
app.all('*', (c) => {
  return c.json({ 
    status: 'error', 
    message: 'Route not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// Exporta a instância do app para ser usada pelo adaptador
export default app;