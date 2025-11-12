// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Home, Beef, User } from 'lucide-react-native';
import React from 'react';
import { Colors } from '@/constants/colors';

// 1. Importe a função 't'
import { t } from '@/lib/i18n';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600' as const,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          // 2. Use a função 't'
          title: t('tabs.dashboard'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="herd"
        options={{
          // 3. Use a função 't'
          title: t('tabs.herd'),
          tabBarIcon: ({ color, size }) => <Beef size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // 4. Use a função 't'
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}