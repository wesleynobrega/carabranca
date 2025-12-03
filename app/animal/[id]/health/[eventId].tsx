// app/animal/[id]/health/[eventId].tsx (COMPLETO E CORRIGIDO)

import { Button } from '@/components/Button';
import { DatePickerInput } from '@/components/DatePickerInput';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import i18n, { t } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { HealthEvent } from '@/types/models';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const eventTypeOptions: HealthEvent['eventType'][] = ['vaccination', 'treatment', 'checkup', 'injury', 'other'];

// Converte uma string 'AAAA-MM-DD' para um objeto Date
const isoToDate = (isoDate: string | undefined): Date => {
  if (!isoDate) return new Date();
  const date = new Date(`${isoDate}T00:00:00`);
  if (isNaN(date.getTime())) return new Date();
  return date;
};

// Converte um objeto Date para o formato 'AAAA-MM-DD'
const dateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function HealthEventDetailScreen() {
  const { id: animalId, eventId } = useLocalSearchParams<{ id: string; eventId: string }>();
  const router = useRouter();
  const trpcUtils = trpc.useContext();

  const { data: event, isLoading: isLoadingEvent, isError, error } = trpc.health.get.useQuery(
    { eventId: eventId! },
    { enabled: !!eventId }
  );

  const updateMutation = trpc.health.update.useMutation();
  const deleteMutation = trpc.health.delete.useMutation();

  const [isEditing, setIsEditing] = useState(false);
  
  const [eventType, setEventType] = useState<HealthEvent['eventType']>('checkup');
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [cost, setCost] = useState('');

  useEffect(() => {
    if (event) {
      setEventType(event.eventType);
      setEventName(event.eventName);
      setDate(isoToDate(event.date));
      setTime(event.time || '');
      setDescription(event.description || '');
      setVeterinarian(event.veterinarian || '');
      setCost(event.cost?.toString() || '');
    }
  }, [event]);

  const handleSave = async () => {
    if (!eventName.trim()) {
      Alert.alert(t('common.error'), t('health.detail.errors.nameRequired'));
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: eventId!,
        updates: {
          eventType,
          eventName: eventName.trim(),
          date: dateToISO(date),
          time: time.trim() || undefined,
          description: description.trim() || undefined,
          veterinarian: veterinarian.trim() || undefined,
          cost: cost ? parseFloat(cost) : undefined,
        }
      });

      await trpcUtils.health.list.invalidate({ animalId: animalId! });
      await trpcUtils.health.get.invalidate({ eventId: eventId! });
      await trpcUtils.health.listAll.invalidate();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert(t('common.error'), t('health.detail.alert.updateFailed'));
    }
  };

  const handleDelete = () => {
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
              await deleteMutation.mutateAsync({ id: eventId! });
              
              await trpcUtils.health.list.invalidate({ animalId: animalId! });
              await trpcUtils.health.listAll.invalidate();
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

  if (isLoadingEvent) {
    return (
      <View style={styles.emptyState}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>{t('health.detail.notFound')}</Text>
        <Text style={styles.errorText}>{error?.message}</Text>
        <Button title={t('common.goBack')} onPress={() => router.back()} />
      </View>
    );
  }

  const renderInfoRow = (label: string, value?: string | null, isMultiline = false) => {
    if (!value) return null;
    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={isMultiline ? styles.infoValueMultiline : styles.infoValue}>{value}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isEditing ? t('health.detail.editTitle') : t('health.detail.viewTitle')}
          </Text>
          <Text style={styles.headerSubtitle}>{event?.eventName}</Text>
        </View>
        {!isEditing && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={22} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isEditing ? (
          <View style={styles.section}>
            <View style={styles.field}>
              <Text style={styles.label}>{t('health.form.typeLabel')}</Text>
              <View style={styles.chipContainer}>
                {eventTypeOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, eventType === option && styles.chipActive]}
                    onPress={() => setEventType(option)}
                  >
                    <Text style={[styles.chipText, eventType === option && styles.chipTextActive]}>
                      {t(`health.eventTypes.${option}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label={t('health.form.nameLabel')}
              placeholder={t('health.form.namePlaceholder')}
              value={eventName}
              onChangeText={setEventName}
            />
            <View style={styles.row}>
              <View style={styles.fieldHalf}>
                <DatePickerInput label={t('health.form.dateLabel')} value={date} onChange={setDate} />
              </View>
              <View style={styles.fieldHalf}>
                 <Input
                    label={t('health.form.timeLabel')}
                    placeholder="HH:MM"
                    value={time}
                    onChangeText={setTime}
                    icon={<Clock size={20} color={Colors.textMuted} />}
                  />
              </View>
            </View>
            <Input
              label={t('common.notes')}
              placeholder={t('common.notesPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={styles.textArea}
            />
            <Input
              label={t('health.form.vetLabel')}
              placeholder={t('health.form.vetPlaceholder')}
              value={veterinarian}
              onChangeText={setVeterinarian}
            />
            <Input
              label={t('health.form.costLabelSimple')}
              placeholder="0.00"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
          </View>
        ) : (
          <View style={styles.section}>
            {renderInfoRow(t('health.form.typeLabel'), t(`health.eventTypes.${event.eventType}`))}
            {renderInfoRow(t('health.form.nameLabel'), event.eventName)}
            <View style={styles.row}>
                {renderInfoRow(t('health.form.dateLabel'), event.date ? isoToDate(event.date).toLocaleDateString(i18n.currentLocale(), { timeZone: 'UTC' }) : null)}
                {renderInfoRow(t('health.form.timeLabel'), event.time)}
            </View>
            {renderInfoRow(t('common.notes'), event.description, true)}
            {renderInfoRow(t('health.form.vetLabel'), event.veterinarian)}
            {renderInfoRow(t('health.form.costLabelSimple'), event.cost ? `R$ ${event.cost.toFixed(2)}` : null)}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isEditing ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                title={t('common.cancel')}
                onPress={() => setIsEditing(false)}
                variant="secondary"
              />
            </View>
            <View style={styles.buttonHalf}>
              <Button 
                title={t('common.save')} 
                onPress={handleSave} 
                loading={updateMutation.isPending}
              />
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
    paddingBottom: 100,
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
    textAlignVertical: 'top',
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
    height: 50, 
  },
  dateInput: {
    flex: 1,
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
    textAlign: 'center',
  },
  errorText: {
    color: Colors.danger,
    textAlign: 'center',
  }
});