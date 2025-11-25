// app/(tabs)/_layout.tsx (CORRIGIDO)

import { Redirect, Tabs } from 'expo-router';
import { Beef, Home, User } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t } from '@/lib/i18n';

export default function TabsLayout() {
  const { user, isLoading } = useHerd();

  // 1. Enquanto o contexto está validando o token, mostra um spinner
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 2. Se não está carregando E não há usuário, redireciona para /login
  if (!user) {
    // Redirecionar para /login (uma rota pública estável)
    // quebra o loop de redirecionamento.
    return <Redirect href="/login" />;
  }

  // 3. Se há usuário, mostra as tabs
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontWeight: '600' as const },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="herd"
        options={{
          title: t('tabs.herd'),
          tabBarIcon: ({ color, size }) => <Beef size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  tabBar: {
    height: 60,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  tabLabel: {
    fontSize: 12,
  },
});