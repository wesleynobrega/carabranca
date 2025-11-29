import { Hono } from 'hono';
import { handle } from 'hono/vercel';

// Criamos a app diretamente aqui para garantir que a Vercel carregue
const app = new Hono();

// Rota de Diagnóstico (Raiz)
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'API is running directly from api/index.ts!',
    timestamp: new Date().toISOString()
  });
});

// Rota de Teste
app.get('/test', (c) => {
  return c.json({ message: 'Test route working' });
});

// Rota Curinga para Debug
app.all('*', (c) => {
  return c.json({
    status: 'error',
    message: 'Route not found',
    path: c.req.path
  }, 404);
});

// Configuração para forçar Node.js
export const config = {
  runtime: 'nodejs',
};

// Exporta o handler
export default handle(app);