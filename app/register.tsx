// app/register.tsx (CORRETO - Nenhuma alteração necessária)

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t } from '@/lib/i18n';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useHerd();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = t('register.errors.fullNameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('register.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('register.errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('register.errors.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('register.errors.passwordLength');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('register.errors.passwordMismatch');
    }

    if (!agreedToTerms) {
      newErrors.terms = t('register.errors.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    console.log('[Register] handleRegister start', { fullName, email });
    if (!validate()) return;

    try {
      setLoading(true);
      // Esta chamada agora aciona o backend tRPC automaticamente
      await register(fullName, email, password); 
      
      Alert.alert(t('common.success'), t('register.alert.successMessage'));
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
      // O erro do tRPC (ex: "E-mail já existe") será capturado aqui
      Alert.alert(t('common.error'), (error as Error).message || t('register.alert.errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t('register.formTitle')}</Text>
      <Text style={styles.description}>
        {t('register.description')}
      </Text>

      <View style={styles.form}>
        <Input
          label={t('register.fullNameLabel')}
          value={fullName}
          onChangeText={(text: string) => {
            setFullName(text);
            if (errors.fullName) setErrors({ ...errors, fullName: undefined });
          }}
          placeholder={t('register.fullNamePlaceholder')}
          error={errors.fullName}
          autoCapitalize="words"
        />

        <Input
          label={t('common.email')}
          value={email}
          onChangeText={(text: string) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          placeholder={t('common.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label={t('common.password')}
          value={password}
          onChangeText={(text: string) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          placeholder={t('register.passwordPlaceholder')}
          secureTextEntry
          error={errors.password}
        />

        <Input
          label={t('register.confirmPasswordLabel')}
          value={confirmPassword}
          onChangeText={(text: string) => {
            setConfirmPassword(text);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          placeholder={t('register.confirmPasswordPlaceholder')}
          secureTextEntry
          error={errors.confirmPassword}
        />

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => {
            setAgreedToTerms(!agreedToTerms);
            if (errors.terms) setErrors({ ...errors, terms: undefined });
          }}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <View style={styles.checkmark} />}
          </View>
          <Text style={styles.checkboxLabel}>
            {t('register.termsAgreement')}
          </Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        <Button
          title={t('register.title')}
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
          size="large"
        />
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: Spacing.sm + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
  button: {
    marginTop: Spacing.md,
  },
});