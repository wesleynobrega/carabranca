import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors'; // 1. DESCOMENTE AQUI
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

const app = new Hono();

// 2. ADICIONE/DESCOMENTE ESTE BLOCO
// Isso libera o acesso para o seu localhost e para o app mobile
app.use('*', cors({
  origin: '*', // Permite qualquer origem (Web local, App, Site de produção)
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
  maxAge: 86400,
}));

// Rota de Diagnóstico
app.get('/', (c) => { 
  return c.json({ status: 'ok', message: 'Hono/tRPC API is running on Render' });
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

// ... (Rota de debug e export)
app.all('*', (c) => {
    return c.json({ 
      status: 'error', 
      message: 'Route not found',
      path: c.req.path
    }, 404);
});

export default app;