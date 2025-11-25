import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t, supportedLocales } from '@/lib/i18n';
import { Stack, useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function LanguagePickerScreen() {
  const router = useRouter();
  const { locale, changeLocale } = useHerd(); // Puxa do contexto

  const handleSelectLocale = async (code: string) => {
    await changeLocale(code);
    // Volta para o perfil, que será recarregado com o novo idioma
    router.replace('/(tabs)/profile');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          presentation: 'modal', 
          title: t('profile.changeLanguage') 
        }} 
      />
      <View style={styles.list}>
        {supportedLocales.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.button}
            onPress={() => handleSelectLocale(lang.code)}
          >
            <Text style={styles.buttonText}>{lang.name}</Text>
            {locale === lang.code && (
              <Check size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  buttonText: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
});