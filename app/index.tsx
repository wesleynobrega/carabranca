import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Leaf } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';

import { t } from '@/lib/i18n';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useHerd();
  const insets = useSafeAreaInsets();

  const handleRedirect = useCallback(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  useEffect(() => {
    handleRedirect();
  }, [handleRedirect]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Leaf size={80} color={Colors.primary} strokeWidth={1.5} />
          </View>
          
          <Text style={styles.title}>Happy Herd</Text>
          {/* 2. Textos traduzidos */}
          <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
          
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            {t('welcome.description')}
          </Text>

          <View style={styles.featureList}>
            <FeatureItem text={t('welcome.feature1')} />
            <FeatureItem text={t('welcome.feature2')} />
            <FeatureItem text={t('welcome.feature3')} />
            <FeatureItem text={t('welcome.feature4')} />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('welcome.getStarted')}
            onPress={() => router.push('/register' as any)}
            size="large"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.bullet} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl + 8,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  imageContainer: {
    width: width - Spacing.lg * 2,
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  descriptionSection: {
    flex: 1,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  featureList: {
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 4,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
  },
  featureText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  buttonContainer: {
    paddingVertical: Spacing.lg,
  },
});
