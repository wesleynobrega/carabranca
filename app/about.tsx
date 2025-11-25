import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { t } from '@/lib/i18n';
import { Stack } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          presentation: 'modal', 
          title: t('profile.aboutApp') 
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Leaf size={64} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Happy Herd</Text>
        <Text style={styles.version}>{t('profile.aboutAppMessage')}</Text>
        <Text style={styles.description}>
          {t('welcome.description')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xl
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  version: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
  }
});