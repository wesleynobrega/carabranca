import app from "./honop";

const port = parseInt(process.env.PORT || "3000");

console.log(`🚀 Servidor iniciando na porta ${port}...`);

export default {
  port: port, 
  hostname: '0.0.0.0', // <--- ADICIONE ESTA LINHA OBRIGATÓRIA PARA DOCKER/RENDER
  fetch: app.fetch,
};