// app/_layout.tsx (COMPLETO E CORRIGIDO)

import { Colors } from "@/constants/colors";
import { HerdProvider } from "@/contexts/HerdContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TRPCProvider } from "@/lib/trpc.tsx";
import '@/lib/i18n'; 

// 1. ADICIONE ESTE IMPORT
import { t } from '@/lib/i18n';

import { HerdRepositoryProvider } from "@/repositories/HerdRepository";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        // 2. TRADUZA OS TEXTOS
        headerBackTitle: t('common.back'),
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: t('register.title'), headerShown: true }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="animal/[id]" 
        options={{ 
          title: t('animal.profileTitle'),
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="animal/add" 
        options={{ 
          title: t('animal.addTitle'),
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="health/[animalId]" 
        options={{ 
          title: t('health.recordsTitle'),
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="health/add" 
        options={{ 
          title: t('health.addEventTitle'),
          headerShown: true,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <TRPCProvider>
      <HerdRepositoryProvider>
        <HerdProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </HerdProvider>
      </HerdRepositoryProvider>
    </TRPCProvider>
  );
}