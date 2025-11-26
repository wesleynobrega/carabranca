// api/index.ts (Este arquivo é o wrapper para a Vercel)

// Importa o default export de honop.ts, que é a função app.fetch.
// Renomeamos para 'honoHandler' para clareza.
import honoHandler from '../backend/honop.ts';

// Exportamos o handler Serverless diretamente.
export default honoHandler;