import { handle } from 'hono/vercel'; // Importa o adaptador
import app from '../backend/honop.js'; // Importa o app (agora exportado como default)

export const config = {
  runtime: 'nodejs', // Garante o uso do runtime Node.js (compatível com seus pacotes)
};

// O 'handle' cria a função compatível com a Vercel (req, res)
export default handle(app);