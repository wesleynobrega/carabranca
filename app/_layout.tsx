// app/_layout.tsx (CORRIGIDO PARA tRPC)

import { Colors } from "@/constants/colors";
import { HerdProvider } from "@/contexts/HerdContext"; // O HerdContext correto (tRPC)
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import '@/lib/i18n';
import { t } from '@/lib/i18n';
import { TRPCProvider } from "@/lib/trpc"; // O Provedor tRPC

// 1. REMOVER A IMPORTAÇÃO DO REPOSITÓRIO
// import { HerdRepositoryProvider } from "@/repositories/HerdRepository";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  // ... (O conteúdo de RootLayoutNav não muda, mas vamos adicionar as telas que faltavam)
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: t('common.back'),
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '600' as const },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: t('register.title'), headerShown: true }} />
      <Stack.Screen name="login" options={{ title: t('login.title'), headerShown: true }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      <Stack.Screen name="health-events" options={{ title: t('health.allEventsTitle'), headerShown: true }} />

      {/* Telas que faltavam no seu _layout.tsx original */}
      <Stack.Screen name="animal/add" options={{ presentation: 'modal', title: t('animal.addTitle') }} />
      <Stack.Screen name="animal/[id]" options={{ title: t('animal.profileTitle') }} />
      <Stack.Screen name="animal/[id]/edit" options={{ presentation: 'modal', title: t('animal.editTitle') }} />
      <Stack.Screen name="animal/[id]/health/index" options={{ title: t('health.recordsTitle') }} />
      <Stack.Screen name="animal/[id]/health/add" options={{ presentation: 'modal', title: t('health.addEventTitle') }} />
      <Stack.Screen name="animal/[id]/health/[eventId]" options={{ presentation: 'modal', title: t('health.detail.title') }} />
      <Stack.Screen name="animal/[id]/descendant" options={{ title: t('animal.descendantsTitle') }} />
      <Stack.Screen name="animal/[id]/add-descendant" options={{ presentation: 'modal', title: t('animal.addDescendantTitle') }} />

    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    // 2. Esta é a pilha de provedores correta para a arquitetura tRPC
    <TRPCProvider>
      <HerdProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </HerdProvider>
    </TRPCProvider>
  );
}