Claro. Com base em toda a nossa análise, este é um `README.md` completo e preciso para o seu projeto, formatado em Markdown.

Ele explica não apenas o *quê*, mas o *porquê* da arquitetura (o padrão de Provedor que implementamos) para que futuros desenvolvedores (ou IAs) entendam a estrutura.

-----

# Happy Herd - Mobile App

Um aplicativo móvel local-first (local-first) para gerenciamento de rebanhos, construído com React Native e Expo.

Este aplicativo permite que os usuários rastreiem animais, eventos de saúde e descendentes, com todos os dados persistidos localmente no dispositivo usando `AsyncStorage`. Ele é estruturado usando uma arquitetura de provedor em camadas para garantir uma inicialização limpa e um fluxo de dados desacoplado.

## 🚀 Stack de Tecnologia

A stack principal deste projeto inclui:

  * **Framework:** React Native (v0.79.1) com Expo (SDK 53)
  * **Runtime:** Bun (inferido do uso)
  * **Roteamento:** Expo Router (v5.0.3)
  * **Linguagem:** TypeScript
  * **Cliente de API:** tRPC (v11)
  * **Estado do Servidor:** React Query (v5)
  * **Servidor Backend:** Hono e tRPC Server
  * **Persistência Local:** `AsyncStorage` (`@react-native-async-storage/async-storage`)
  * **Gerenciamento de Estado Local:** React Context (via `@nkzw/create-context-hook`)

## 📋 Funcionalidades

  * **Gerenciamento de Rebanho:** Adicione, visualize, edite e exclua animais.
  * **Rastreamento de Saúde:** Registre eventos de saúde para cada animal.
  * **Gerenciamento de Linhagem:** Rastreie descendentes (filhos) de pais.
  * **Persistência Local-First:** Todos os dados são salvos com segurança no dispositivo usando `AsyncStorage`.
  * **Filtragem e Busca:** Filtre o rebanho por tipo (vaca, bezerro, etc.) e status.

## 🏛️ Arquitetura e Fluxo de Dados

O aplicativo utiliza um padrão de **Injeção de Dependência via Provedores React** para gerenciar a lógica de dados e evitar "race conditions" (condições de corrida) na inicialização.

A inicialização de módulos nativos (como `AsyncStorage`) ou o acesso a variáveis de ambiente (`process.env`) no escopo global (nível superior) quebra o bundler do Expo Router. A arquitetura deste aplicativo resolve isso aninhando provedores em `app/_layout.tsx`.

A ordem de aninhamento é crucial:

1.  **`TRPCProvider`** (`lib/trpc.tsx`):

      * **O que faz:** Inicializa o cliente tRPC e o `QueryClient`.
      * **Quando:** Somente quando o componente React é renderizado, permitindo o acesso seguro a `process.env` para a URL da API.

2.  **`HerdRepositoryProvider`** (`repositories/HerdRepository.tsx`):

      * **O que faz:** Instancia a classe `HerdRepository`.
      * **Quando:** Somente quando o componente React é renderizado. Isso atrasa a importação do `StorageService` (e, portanto, do `AsyncStorage`) até que o React Native esteja pronto.

3.  **`HerdProvider`** (`contexts/HerdContext.tsx`):

      * **O que faz:** Consome o `HerdRepository` (via hook `useHerdRepository()`) e gerencia o estado na memória (lista de animais, usuário).
      * **Quando:** Renderiza *dentro* dos outros provedores, garantindo que suas dependências (repositório e tRPC) estejam prontas.

Esse padrão garante que nenhum módulo nativo ou variável de ambiente seja acessado antes que o aplicativo esteja totalmente inicializado.

## 📂 Estrutura do Projeto

```
.
├── app/                  # Telas e layouts do Expo Router
│   ├── (tabs)/           # Layout de abas (ex: herd.tsx)
│   ├── _layout.tsx       # Layout raiz (onde os Provedores são aninhados)
│   └── register.tsx      # Tela de registro
├── backend/              # Servidor Hono/tRPC
├── constants/            # Constantes (colors.ts, spacing, etc.)
├── contexts/             # Provedores de estado (HerdContext.tsx)
├── lib/                  # Clientes de API (trpc.tsx)
├── repositories/         # Lógica de dados (HerdRepository.tsx)
├── services/             # Serviços de baixo nível (storage.ts)
└── types/                # Modelos de dados (models.ts)
```

## ⚙️ Configuração e Execução

Siga estes passos para executar o projeto localmente.

### 1\. Pré-requisitos

  * Node.js (LTS)
  * Bun
  * Android Studio (para o Emulador Android)

### 2\. Instalar Dependências

Clone o repositório e instale os pacotes:

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-projeto>
bun install
```

### 3\. Configurar o Backend

O cliente tRPC espera um servidor backend.

1.  Navegue até o diretório `backend/`.
2.  Inicie o servidor Hono/tRPC (o comando pode variar):
    ```bash
    cd backend
    bun run dev 
    ```
3.  Anote a porta em que o servidor está rodando (ex: `3000`).

### 4\. Configurar o Aplicativo (Expo)

O aplicativo precisa saber onde encontrar o servidor backend.

1.  **Crie um arquivo `.env`** na **raiz** do projeto (no mesmo nível que `package.json`).

2.  **Adicione a URL da API.** Como você está usando um Emulador Android, você **deve** usar o IP especial `10.0.2.2` para acessar o `localhost` da sua máquina host (Fedora).

    ```bash
    # No arquivo .env
    # Substitua 3000 pela porta real do seu backend
    EXPO_PUBLIC_RORK_API_BASE_URL="http://10.0.2.2:3000"
    ```

### 5\. Executar o Aplicativo

1.  Abra o Android Studio e inicie um Emulador.

2.  Execute o script `start` do `package.json` (que usa `rork`, a CLI deste projeto):

    ```bash
    bun run start
    ```

3.  O Metro Bundler será iniciado. Pressione `a` no terminal para abrir o aplicativo no seu Emulador Android.

-----