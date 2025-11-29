import { handle } from 'hono/vercel';
// REMOVA o '.js' do final. Deixe o bundler resolver o arquivo .ts original
import app from '../backend/honop.js';

export const config = {
  runtime: 'nodejs',
};

export default handle(app);