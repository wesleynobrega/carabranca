// @/lib/trpc.js (ou .ts)

import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router"; // Mantenha seu tipo de Rota
import superjson from "superjson";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 1. A criação do 'trpc' continua a mesma
export const trpc = createTRPCReact<AppRouter>();

// 2. NÃO EXPORTE O trpcClient DAQUI

// 3. CRIE E EXPORTE O NOVO PROVIDER
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  
  // Usamos useState para garantir que os clientes sejam criados 
  // APENAS UMA VEZ e SÓ QUANDO O COMPONENTE RENDERIZAR.
  const [queryClient] = useState(() => new QueryClient());
  
  const [trpcClient] = useState(() => {
    
    // A lógica de getBaseUrl agora vive aqui dentro
    const getBaseUrl = () => {
      // Agora o process.env está 100% carregado
      if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
      }
      throw new Error(
        "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
      );
    };

    // A criação do cliente tRPC agora vive aqui
    return trpc.createClient({
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
    });
  });

  // 4. Retorne os providers do tRPC e do React Query
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}