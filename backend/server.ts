import app from "./honop.js";

const port = parseInt(process.env.PORT || "3000");

console.log(`🚀 Servidor rodando na porta ${port}`);

// O Bun detecta automaticamente o export default e inicia o servidor
export default {
  port: port,
  fetch: app.fetch,
};