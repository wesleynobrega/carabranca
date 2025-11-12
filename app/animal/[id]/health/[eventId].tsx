import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Trash2 } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { Button } from '@/components/Button';
import { HealthEvent } from '@/types/models';
import { herdRepository } from '@/repositories/HerdRepository';

// 1. Importar i18n e t
import i18n, { t } from '@/lib/i18n';

export default function HealthEventDetailScreen() {
  const { id, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  const { getAnimalById } = useHerd();
  const [event, setEvent] = useState<HealthEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const animal = getAnimalById(id!);
  const [eventType, setEventType] = useState<HealthEvent['eventType']>('checkup');
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const events = await herdRepository.getHealthEvents(id!);
      const foundEvent = events.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        // ... (carrega o estado do formulário)
        setEventType(foundEvent.eventType);
        setEventName(foundEvent.eventName);
        setDate(foundEvent.date);
        setTime(foundEvent.time || '');
        setDescription(foundEvent.description || '');
        setVeterinarian(foundEvent.veterinarian || '');
        setCost(foundEvent.cost?.toString() || '');
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // 2. Usar 't' para alertas
    if (!eventName.trim()) {
      Alert.alert(t('common.error'), t('health.detail.errors.nameRequired'));
      return;
    }

    try {
      await herdRepository.updateHealthEvent(eventId!, {
        eventType,
        eventName: eventName.trim(),
        date,
        time: time.trim() || undefined,
        description: description.trim() || undefined,
        veterinarian: veterinarian.trim() || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      });
      setIsEditing(false);
      await loadEvent();
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert(t('common.error'), t('health.detail.alert.updateFailed'));
    }
  };

  const handleDelete = () => {
    // 3. Usar 't' para o alerta de exclusão
    Alert.alert(
      t('health.detail.alert.deleteTitle'),
      t('health.detail.alert.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await herdRepository.deleteHealthEvent(eventId!);
              router.back();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert(t('common.error'), t('health.detail.alert.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  // Esta estrutura de dados não precisa de tradução
  const eventTypes: { value: HealthEvent['eventType'] }[] = [
    { value: 'vaccination' },
    { value: 'treatment' },
    { value: 'checkup' },
    { value: 'injury' },
    { value: 'other' },
  ];

  if (!animal || isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          {/* 4. Usar 't' para estados de loading/erro */}
          <Text style={styles.emptyText}>{isLoading ? t('common.loading') : t('health.detail.notFound')}</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('health.detail.notFound')}</Text>
          <Button title={t('common.goBack')} onPress={() => router.back()} />
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
          {/* 5. Usar 't' para o header */}
          <Text style={styles.headerTitle}>{t('health.detail.title')}</Text>
          <Text style={styles.headerSubtitle}>#{animal.tagId}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          {isEditing ? (
            <>
              {/* 6. Usar 't' para todo o formulário de edição */}
              <View style={styles.field}>
                <Text style={styles.label}>{t('health.form.typeLabel')} *</Text>
                <View style={styles.chipContainer}>
                  {eventTypes.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[styles.chip, eventType === type.value && styles.chipActive]}
                      onPress={() => setEventType(type.value)}
                    >
                      <Text style={[styles.chipText, eventType === type.value && styles.chipTextActive]}>
                        {/* 7. Mapear o 'value' para a chave de tradução */}
                        {t(`health.eventTypes.${type.value}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('health.form.nameLabel')} *</Text>
                <TextInput
                  style={styles.input}
                  value={eventName}
                  onChangeText={setEventName}
                  placeholder={t('health.form.namePlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('health.form.dateLabel')} *</Text>
                  <View style={styles.dateInputContainer}>
                    <Calendar size={20} color={Colors.textMuted} />
                    <TextInput
                      style={styles.dateInput}
                      value={date}
                      onChangeText={setDate}
                      placeholder={t('health.form.datePlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
                <View style={[styles.field, styles.fieldHalf]}>
                  <Text style={styles.label}>{t('health.form.timeLabel')}</Text>
                  <View style={styles.dateInputContainer}>
                    <Clock size={20} color={Colors.textMuted} />
                    <TextInput
                      style={styles.dateInput}
                      value={time}
                      onChangeText={setTime}
                      placeholder={t('health.form.timePlaceholder')}
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('health.form.vetLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={veterinarian}
                  onChangeText={setVeterinarian}
                  placeholder={t('health.form.vetPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('health.form.costLabel')}</Text>
                <TextInput
                  style={styles.input}
                  value={cost}
                  onChangeText={setCost}
                  placeholder={t('health.form.costPlaceholder')}
                  keyboardType="numeric"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{t('common.notes')}</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('common.notesPlaceholder')}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </>
          ) : (
            <>
              {/* 8. Usar 't' para o modo de visualização */}
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t('health.form.typeLabel')}</Text>
                <Text style={styles.infoValue}>
                  {t(`health.eventTypes.${event.eventType}`)}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t('health.form.nameLabel')}</Text>
                <Text style={styles.infoValue}>{event.eventName}</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.infoCard, styles.fieldHalf]}>
                  <Text style={styles.infoLabel}>{t('health.form.dateLabel')}</Text>
                  <Text style={styles.infoValue}>
                    {/* 9. Usar o locale para formatar datas */}
                    {new Date(event.date).toLocaleDateString(i18n.currentLocale())}
                  </Text>
                </View>
                {event.time && (
                  <View style={[styles.infoCard, styles.fieldHalf]}>
                    <Text style={styles.infoLabel}>{t('health.form.timeLabel')}</Text>
                    <Text style={styles.infoValue}>{event.time}</Text>
                  </View>
                )}
              </View>

              {event.veterinarian && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>{t('health.form.vetLabel')}</Text>
                  <Text style={styles.infoValue}>{event.veterinarian}</Text>
                </View>
              )}

              {event.cost && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>{t('health.form.costLabelSimple')}</Text>
                  {/* Manter a formatação de moeda local (R$) */}
                  <Text style={styles.infoValue}>R$ {event.cost.toFixed(2)}</Text>
                </View>
              )}

              {event.description && (
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>{t('common.notes')}</Text>
                  <Text style={styles.infoValueMultiline}>{event.description}</Text>
                </View>
              )}

              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>{t('common.created')}</Text>
                <Text style={styles.infoValue}>
                  {new Date(event.createdAt).toLocaleString(i18n.currentLocale())}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* 10. Usar 't' para os botões do rodapé */}
        {isEditing ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                title={t('common.cancel')}
                onPress={() => {
                  setIsEditing(false);
                  loadEvent();
                }}
                variant="secondary"
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button title={t('common.save')} onPress={handleSave} />
            </View>
          </View>
        ) : (
          <Button title={t('health.detail.editButton')} onPress={() => setIsEditing(true)} />
        )}
      </View>
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
  deleteButton: {
    padding: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  section: {
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.sm,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textLight,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  dateInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
  },
  infoCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  infoValueMultiline: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.textLight,
  },
});
