import { trpcServer } from '@hono/trpc-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

// Nota: não fazemos checagens condicionais em tempo de execução aqui —
// o build e o runtime apontam se algo estiver faltando. Para evitar
// erros de tipagem no `trpcServer` ajustamos o tipo de `createContext`
// abaixo (cast para `any`) de forma controlada.

const app = new Hono();

// Aplicar CORS a todas as rotas
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type'],
}));

// CORREÇÃO: Adicionar o parâmetro 'endpoint'
app.use(
  '/api/trpc/*',
  trpcServer({
    endpoint: '/api/trpc',  // ESSENCIAL para o roteamento correto!
    router: appRouter,
    // Cast controlado
    createContext: createContext as any,
  })
);

// ✅ EXPORTAÇÃO CORRIGIDA para Vercel: exporta a função fetch.
export default app.fetch;