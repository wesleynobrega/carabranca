import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t } from '@/lib/i18n';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileInfoScreen() {
  const router = useRouter();
  const { user } = useHerd();
  
  // Estados para os formulários
  const [fullName, setFullName] = useState(user?.fullName || '');
  
  const handleSave = () => {
    // TODO: Implementar trpc.auth.updateUser.mutateAsync(...)
    Alert.alert(t('common.comingSoon'), t('profile.comingSoon.editProfile'));
  };

  const handleUpdatePassword = () => {
    // TODO: Implementar trpc.auth.updatePassword.mutateAsync(...)
    Alert.alert(t('common.comingSoon'));
  };

  return (
    <View style={styles.container}>
      {/* Isto garante que a tela seja um modal */}
      <Stack.Screen 
        options={{ 
          presentation: 'modal', 
          title: t('profile.info'),
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={{ marginRight: Spacing.sm }}>
              <Text style={styles.headerSaveButton}>{t('common.save')}</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
          <Input
            label={t('register.fullNameLabel')}
            value={fullName}
            onChangeText={setFullName}
            placeholder={t('register.fullNamePlaceholder')}
          />
          <Input
            label={t('common.email')}
            value={user?.email || ''}
            editable={false} // E-mail não pode ser editado
            style={styles.inputDisabled}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.emailSettings')}</Text>
          <Input
            label={t('common.password')}
            placeholder={t('profile.changePasswordPlaceholder')}
            secureTextEntry
          />
           <Input
            label={t('register.confirmPasswordLabel')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            secureTextEntry
          />
          <Button
            title={t('profile.updatePassword')}
            onPress={handleUpdatePassword}
            variant="outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  inputDisabled: {
    backgroundColor: Colors.borderLight,
    color: Colors.textMuted,
  },
  headerSaveButton: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  }
});