// lib/trpc.tsx (COMPLETO E CORRIGIDO)

"use client";

// 1. CAMINHOS CORRIGIDOS (usando os aliases do tsconfig.json)
import type { AppRouter } from '@/backend/trpc/app-router';
import { StorageService } from '@/services/storage';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useMemo } from 'react';
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);
  
  const trpcClient = useMemo(() => {
    const getBaseUrl = () => {
      if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
        return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
      }
      throw new Error('No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL');
    };

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          async headers() {
            const token = await StorageService.getToken();
            if (typeof __DEV__ !== 'undefined' && __DEV__) {
              // eslint-disable-next-line no-console
              console.debug('[TRPC] headers getToken ->', !!token);
            }
            if (token) {
              return {
                Authorization: `Bearer ${token}`,
              };
            }
            return {};
          },
        }),
      ],
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </trpc.Provider>
    </QueryClientProvider>
  );
}