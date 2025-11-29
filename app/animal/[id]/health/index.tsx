// app/animal/[id]/health/index.tsx (COMPLETO E CORRIGIDO)

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import i18n, { t } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, ChevronRight, FileText, Pill, Plus, Stethoscope, Syringe } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HealthEvent } from '../../../types/models.js';

const eventIcons: Record<HealthEvent['eventType'], any> = {
  vaccination: Syringe,
  treatment: Pill,
  checkup: Stethoscope,
  injury: AlertCircle,
  other: FileText,
};

const eventColors: Record<HealthEvent['eventType'], string> = {
  vaccination: '#10B981',
  treatment: '#F59E0B',
  checkup: '#3B82F6',
  injury: '#EF4444',
  other: '#6B7280',
};

export default function HealthRecordsScreen() {
  const { id: animalId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getAnimalById } = useHerd();

  // Adicionado estado de carregamento para animalId
  if (!animalId) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  const animal = getAnimalById(animalId);

  const { 
    data: healthEvents = [], 
    isLoading, 
    refetch 
  } = trpc.health.list.useQuery(
    { animalId: animalId },
    { enabled: !!animalId } 
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const sortedEvents = React.useMemo(() => {
    return [...healthEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [healthEvents]);

  if (!animal && !isLoading) { 
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('animal.notFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('health.recordsTitle')}</Text>
          <Text style={styles.headerSubtitle}>#{animal?.tagId} {animal?.name ? `- ${animal.name}` : ''}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : sortedEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {sortedEvents.map((event) => {
              const IconComponent = eventIcons[event.eventType];
              const iconColor = eventColors[event.eventType];

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/animal/${animalId}/health/${event.id}` as any)}
                >
                  <View style={[styles.eventIcon, { backgroundColor: iconColor + '20' }]}>
                    <IconComponent size={24} color={iconColor} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{event.eventName}</Text>
                    <Text style={styles.eventType}>{t(`health.eventTypes.${event.eventType}`)}</Text>
                    {animal && (
                      <Text style={styles.animalInfo}>
                        #{animal.tagId}{animal.name ? ` - ${animal.name}` : ''}
                      </Text>
                    )}
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventDate}>
                        {new Date(event.date).toLocaleDateString(i18n.currentLocale())}
                      </Text>
                      {event.time && (
                        <>
                          <Text style={styles.eventMetaSeparator}>•</Text>
                          <Text style={styles.eventTime}>{event.time}</Text>
                        </>
                      )}
                    </View>
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={2}>
                        {event.description}
                      </Text>
                    )}
                  </View>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyListState}>
            <Stethoscope size={64} color={Colors.textMuted} />
            <Text style={styles.emptyListText}>{t('health.empty.titleAnimal')}</Text>
            <Text style={styles.emptyListSubtext}>
              {t('health.empty.subtitleAnimal')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/animal/${animalId}/health/add` as any)}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.white + 'CC',
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  eventsList: {
    gap: Spacing.md,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  eventName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  eventType: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'capitalize' as const,
  },
  animalInfo: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eventDate: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  eventMetaSeparator: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  eventTime: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  eventDescription: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  emptyListState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyListText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
  },
  emptyListSubtext: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textLight,
  },
});