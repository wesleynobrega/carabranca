# Usa a imagem oficial do Bun
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package.json bun.lock ./

# Instala as dependências (incluindo as do backend)
RUN bun install --frozen-lockfile

# Copia todo o código do projeto
COPY . .

# Expõe a porta 3000 (padrão do Hono/Bun)
EXPOSE 3000

# O comando que inicia o servidor
CMD ["bun", "run", "start"]