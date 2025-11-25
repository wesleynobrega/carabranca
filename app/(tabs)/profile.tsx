// app/(tabs)/profile.tsx (CORRIGIDO)

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
// 1. Remover useRouter se não for mais usado para outras coisas
import { useRouter } from 'expo-router';
import { Info, LogOut, Mail, User } from 'lucide-react-native';
import React from 'react';
// 2. Importar 'Platform' para o alerta
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { t } from '@/lib/i18n';

export default function ProfileScreen() {
  const router = useRouter(); // Necessário para os outros botões
  const { user, logout, animals } = useHerd();

  const handleLogout = () => {
    const title = t('profile.logoutTitle');
    const message = t('profile.logoutMessage');

    const doLogout = async () => {
      await logout();
      // 3. LINHA REMOVIDA:
      // router.replace('/'); 
      // O (tabs)/_layout.tsx agora trata disso.
    };

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        doLogout();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.logout'), 
            style: 'destructive',
            onPress: doLogout,
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <User size={48} color={Colors.white} />
        </View>
        <Text style={styles.name}>{user?.fullName || t('common.user')}</Text>
        <Text style={styles.email}>{user?.email || t('common.emailExample')}</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{animals.length}</Text>
          <Text style={styles.statLabel}>{t('dashboard.stats.totalAnimals')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{animals.filter(a => a.status === 'active').length}</Text>
          <Text style={styles.statLabel}>{t('animal.status.active')}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{animals.filter(a => a.status === 'for_sale').length}</Text>
          <Text style={styles.statLabel}>{t('dashboard.stats.forSale')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.account')}</Text>
        <MenuButton
          icon={<User size={20} color={Colors.text} />}
          title={t('profile.info')}
          onPress={() => router.push('/profile-info')} // Corrigido para a tela correta
        />
        <MenuButton
          icon={<Mail size={20} color={Colors.text} />}
          title={t('profile.emailSettings')}
          onPress={() => router.push('/profile-info')} // Corrigido para a tela correta
        />
      </View>

      {/* Seção de Idioma (como implementamos) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
        <MenuButton
          icon={<User size={20} color={Colors.text} />} // Você pode querer usar o ícone 'Languages'
          title={t('profile.changeLanguage')}
          onPress={() => router.push('/language-picker')} // Corrigido para a tela correta
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.about')}</Text>
        <MenuButton
          icon={<Info size={20} color={Colors.text} />}
          title={t('profile.aboutApp')}
          onPress={() => router.push('/about')} // Corrigido para a tela correta
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>{t('common.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ... (Componente MenuButton e Estilos permanecem os mesmos) ...
interface MenuButtonProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

function MenuButton({ icon, title, onPress }: MenuButtonProps) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuButtonContent}>
        {icon}
        <Text style={styles.menuButtonText}>{title}</Text>
      </View>
    </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  menuButton: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuButtonText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.lg,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.error,
  },
});