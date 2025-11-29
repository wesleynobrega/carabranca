// import { trpcServer } from '@hono/trpc-server'; // COMENTADO
import { Hono } from 'hono';
// import { appRouter } from './trpc/app-router.js'; // COMENTADO
// import { createContext } from './trpc/create-context.js'; // COMENTADO

const app = new Hono();

// Rota de Teste Simples
app.get('/', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Vercel connection is working!', 
    timestamp: new Date().toISOString() 
  });
});

// Rota de Teste para ver se o 'wildcard' funciona
app.get('/api/test', (c) => {
  return c.json({ message: 'Test route working' });
});

/* // COMENTADO TEMPORARIAMENTE PARA ISOLAR O PROBLEMA
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',
    router: appRouter,
    createContext: createContext as any,
  })
);
*/

// Rota de Debug (Catch-All)
app.all('*', (c) => {
    return c.json({ 
      status: 'error', 
      message: 'Route not found',
      path: c.req.path
    }, 404);
});

export default app;