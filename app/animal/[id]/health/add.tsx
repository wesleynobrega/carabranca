import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, Clock } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { Button } from '@/components/Button';
import { HealthEvent } from '@/types/models';

// 1. Importar a função 't'
import { t } from '@/lib/i18n';

export default function AddHealthEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addHealthEvent, getAnimalById } = useHerd();
  
  const animal = getAnimalById(id!);
  const [eventType, setEventType] = useState<HealthEvent['eventType']>('checkup');
  const [eventName, setEventName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [veterinarian, setVeterinarian] = useState('');
  const [cost, setCost] = useState('');

  const handleSave = async () => {
    // 2. Usar 't' para o alerta de erro
    if (!eventName.trim()) {
      // Usar 'Alert' em vez de 'alert' para um visual nativo
      Alert.alert(t('common.error'), t('health.detail.errors.nameRequired'));
      return;
    }

    try {
      await addHealthEvent({
        animalId: id!,
        eventType,
        eventName: eventName.trim(),
        date,
        time: time.trim() || undefined,
        description: description.trim() || undefined,
        veterinarian: veterinarian.trim() || undefined,
        cost: cost ? parseFloat(cost) : undefined,
      });
      router.back();
    } catch (error) {
      console.error('Error adding health event:', error);
      Alert.alert(t('common.error'), t('health.form.alert.addFailed'));
    }
  };

  // Esta estrutura não precisa de tradução
  const eventTypes: { value: HealthEvent['eventType'] }[] = [
    { value: 'vaccination' },
    { value: 'treatment' },
    { value: 'checkup' },
    { value: 'injury' },
    { value: 'other' },
  ];

  if (!animal) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          {/* 3. Usar 't' para o estado de erro */}
          <Text style={styles.emptyText}>{t('animal.notFound')}</Text>
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
          {/* 4. Usar 't' para o título (já definido no app/_layout.tsx) */}
          <Text style={styles.headerTitle}>{t('health.addEventTitle')}</Text>
          <Text style={styles.headerSubtitle}>#{animal.tagId}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          {/* 5. Usar as chaves 't' do formulário (a maioria já existe) */}
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
              placeholder={t('health.form.namePlaceholderAdd')}
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
              placeholder={t('common.notesPlaceholderObservations')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('health.form.saveButton')} onPress={handleSave} />
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
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
    marginBottom: Spacing.lg,
  },
});