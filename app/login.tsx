import { Link, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t } from '@/lib/i18n';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // 1. Obter a função 'login' real do contexto
  const { login } = useHerd(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. Lógica 'handleLogin' FINAL
  const handleLogin = async () => {
    console.log('[Login] handleLogin start', { email, password: !!password });
    // Validar se os campos não estão vazios
    if (!email || !password) {
      setError(t('login.error.required'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 3. Chamar a função 'login' do contexto
      const user = await login(email, password); 
      
      // 4. Sucesso: Redirecionar para o dashboard
      if (user) {
        router.replace('/(tabs)');
      } else {
        // (Este 'else' não deve ser atingido se o backend atirar um erro)
        setError(t('login.error.invalid'));
      }
    } catch (err) {
      // 5. Falha: Apanhar o erro do tRPC/Supabase
      // e exibi-lo na tela.
      console.error('Login error:', err);
      setError((err as Error).message || t('login.error.invalid'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.md, paddingBottom: insets.bottom + Spacing.lg }
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.title}>{t('login.title')}</Text>
          <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

          <View style={styles.inputGroup}>
            <Input
              label={t('login.emailLabel')}
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error ? ' ' : undefined} // Mostra o input como inválido
            />

            <Input
              label={t('login.passwordLabel')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={error ? ' ' : undefined} // Mostra o input como inválido
            />
            
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>
                {t('login.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 6. Exibir a mensagem de erro */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              title={t('login.submitButton')}
              onPress={handleLogin}
              size="large"
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('login.noAccount')}</Text>
            <Link href="/register" asChild>
                <TouchableOpacity onPress={() => console.log('[Login] register link touched')}>
                <Text style={styles.footerLink}>{t('login.registerLink')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ... (Estilos completos) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  errorContainer: {
    backgroundColor: '#FDECEA', 
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  errorText: {
    color: '#D32F2F', 
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  footerText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  footerLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});