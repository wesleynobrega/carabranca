import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Syringe, Stethoscope, Pill, AlertCircle, FileText, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { HealthEvent } from '@/types/models';

// 1. Importar o 'i18n' (para o locale) e o 't' (para tradução)
import i18n, { t } from '@/lib/i18n';

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

export default function AllHealthEventsScreen() {
  const router = useRouter();
  const { getAllHealthEvents, animals } = useHerd();
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllHealthEvents();
  }, []);

  const loadAllHealthEvents = async () => {
    try {
      setIsLoading(true);
      const events = await getAllHealthEvents();
      setHealthEvents(events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading health events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnimalInfo = (animalId: string) => {
    return animals.find(a => a.id === animalId);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {/* 2. Textos do Header traduzidos */}
          <Text style={styles.headerTitle}>{t('health.allEventsTitle')}</Text>
          <Text style={styles.headerSubtitle}>
            {healthEvents.length} {healthEvents.length === 1 ? t('health.eventSingular') : t('health.eventPlural')}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingState}>
            {/* 3. Loading traduzido (chave comum) */}
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : healthEvents.length > 0 ? (
          <View style={styles.eventsList}>
            {healthEvents.map((event) => {
              const IconComponent = eventIcons[event.eventType];
              const iconColor = eventColors[event.eventType];
              const animal = getAnimalInfo(event.animalId);

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push(`/animal/${event.animalId}/health/${event.id}` as any)}
                >
                  <View style={[styles.eventIcon, { backgroundColor: iconColor + '20' }]}>
                    <IconComponent size={24} color={iconColor} />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventName}>{event.eventName}</Text>
                    {/* 4. Mapeamento dinâmico do tipo de evento */}
                    <Text style={styles.eventType}>
                      {t(`health.eventTypes.${event.eventType}`)}
                    </Text>
                    {animal && (
                      <Text style={styles.animalInfo}>
                        #{animal.tagId}{animal.name ? ` - ${animal.name}` : ''}
                      </Text>
                    )}
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventDate}>
                        {/* 5. Usar o locale do i18n para formatar a data */}
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
            {/* 6. Estado de lista vazia traduzido */}
            <Stethoscope size={64} color={Colors.textMuted} />
            <Text style={styles.emptyListText}>{t('health.empty.title')}</Text>
            <Text style={styles.emptyListSubtext}>
              {t('health.empty.subtitle')}
            </Text>
          </View>
        )}
      </ScrollView>
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
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
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
    paddingHorizontal: Spacing.xl,
  },
});
