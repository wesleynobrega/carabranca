import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
// import { cors } from 'hono/cors'; // Removido conforme instrução anterior
import { appRouter } from './trpc/app-router.js';
import { createContext } from './trpc/create-context.js';

const app = new Hono();

// --- SUAS ROTAS NORMAIS ---

// 1. Rota de diagnóstico
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

// --- ROTA DE DEBUG (O CÓDIGO QUE VOCÊ PERGUNTOU) ---
// Coloque aqui, DEPOIS de todas as outras rotas e ANTES do export
app.all('*', (c) => {
  return c.json({ 
    status: 'error', 
    message: 'Route not found',
    path: c.req.path,
    method: c.req.method
  }, 404);
});

// --- EXPORTAÇÃO ---
export default app;