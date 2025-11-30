import { handle } from 'hono/vercel';
// Importa a lógica real do seu backend. 
// A extensão .js é necessária devido ao "type": "module" no package.json
import app from '../backend/honop.js';

export const config = {
  runtime: 'nodejs',
};

// Transforma seu app Hono em uma Vercel Serverless Function
export default handle(app);