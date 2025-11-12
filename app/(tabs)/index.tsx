import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { useRouter } from 'expo-router';
import { Activity, HeartPulse, Plus, TrendingUp } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Importar a função 't'
import { t } from '@/lib/i18n';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, animals } = useHerd();

  const stats = useMemo(() => {
    const totalAnimals = animals.length;
    const cows = animals.filter(a => a.type === 'cow' || a.type === 'bull').length;
    const calves = animals.filter(a => a.type === 'calf').length;
    const forSale = animals.filter(a => a.status === 'for_sale').length;

    return { totalAnimals, cows, calves, forSale };
  }, [animals]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.greeting}>
        {/* 2. Textos de saudação traduzidos */}
        <Text style={styles.greetingTitle}>{t('dashboard.welcomeBack')}</Text>
        <Text style={styles.greetingName}>{user?.fullName || t('common.owner')}</Text>
      </View>

      {/* 3. StatCards traduzidas */}
      <View style={styles.statsContainer}>
        <StatCard
          title={t('dashboard.stats.totalAnimals')}
          value={stats.totalAnimals}
          icon={<Activity size={24} color={Colors.primary} />}
          color={Colors.primary}
        />
        <StatCard
          title={t('dashboard.stats.adults')}
          value={stats.cows}
          icon={<TrendingUp size={24} color={Colors.secondary} />}
          color={Colors.secondary}
        />
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title={t('dashboard.stats.calves')}
          value={stats.calves}
          icon={<Activity size={24} color={Colors.accent} />}
          color={Colors.accent}
        />
        <StatCard
          title={t('dashboard.stats.forSale')}
          value={stats.forSale}
          icon={<TrendingUp size={24} color={Colors.info} />}
          color={Colors.info}
        />
      </View>

      <View style={styles.section}>
        {/* 4. Ações rápidas traduzidas */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions.title')}</Text>
        <View style={styles.actionsContainer}>
          <ActionButton
            title={t('animal.addTitle')}
            icon={<Plus size={24} color={Colors.white} />}
            onPress={() => router.push('/animal/add' as any)}
          />
          <ActionButton
            title={t('dashboard.quickActions.viewHerd')}
            icon={<Activity size={24} color={Colors.white} />}
            onPress={() => router.push('/(tabs)/herd')}
            variant="secondary"
          />
          <ActionButton
            title={t('dashboard.quickActions.healthEvents')}
            icon={<HeartPulse size={24} color={Colors.white} />}
            onPress={() => router.push('/health-events' as any)}
            variant="accent"
          />
        </View>
      </View>

      {/* 5. Estado de rebanho vazio (usando as chaves que criamos) */}
      {animals.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('animal.empty.herdTitle')}</Text>
          <Text style={styles.emptyText}>
            {t('animal.empty.herdSubtitle')}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          {icon}
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

interface ActionButtonProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

function ActionButton({ title, icon, onPress, variant = 'primary' }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === 'secondary' && styles.actionButtonSecondary,
        variant === 'accent' && styles.actionButtonAccent,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon}
      <Text style={styles.actionButtonText}>{title}</Text>
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
  greeting: {
    marginBottom: Spacing.xl,
  },
  greetingTitle: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  greetingName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statContent: {
    gap: Spacing.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statTitle: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  statValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm + 4,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.secondary,
  },
  actionButtonAccent: {
    backgroundColor: Colors.accent,
  },
  actionButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.white,
  },
  emptyState: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
