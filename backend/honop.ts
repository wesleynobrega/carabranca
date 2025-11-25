import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

const app = new Hono();

// Aplicar CORS a todas as rotas
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

// ✅ ROTA DE DIAGNÓSTICO/HEALTH CHECK
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Hono/tRPC API is running on Vercel' });
});

// A rota tRPC
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext as any,
  })
);

// ✅ EXPORTAÇÃO CORRIGIDA para Vercel
export default app.fetch;