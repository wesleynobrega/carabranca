import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Feather,
  HeartPulse,
  Palette,
  Tag,
  Trash2,
  Users,
  Weight
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/Button';
import { DatePickerInput } from '@/components/DatePickerInput';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext'; // 1. Precisamos do 'locale' e do 'deleteAnimal'
import { t } from '@/lib/i18n';
import { trpc } from '@/lib/trpc'; // 2. Importar tRPC
import { useQueryClient } from '@tanstack/react-query';

// Converte uma string 'AAAA-MM-DD' para um objeto Date
const isoToDate = (isoDate: string | undefined): Date => {
  if (!isoDate) return new Date();
  // Adiciona 'T00:00:00' para garantir que a data seja interpretada em UTC
  const date = new Date(`${isoDate}T00:00:00`);
  if (isNaN(date.getTime())) return new Date(); // Fallback para datas inválidas
  return date;
};

// Converte um objeto Date para o formato 'AAAA-MM-DD'
const dateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function AnimalProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const trpcUtils = trpc.useContext();
  
  // 3. Buscar dados com tRPC
  const { data: animal, isLoading, error } = trpc.animal.get.useQuery({ id: id! });
  
  // 4. Pegar 'locale' e 'deleteAnimal' do contexto
  const { locale, deleteAnimal: deleteAnimalFromContext } = useHerd();

  // 5. Mutação de delete do tRPC
  const deleteMutation = trpc.animal.delete.useMutation();
  const updateMutation = trpc.animal.update.useMutation();

  // Estado para controlar o modo de edição
  const [isEditing, setIsEditing] = useState(false);

  // Estados do formulário (para o modo de edição)
  const [tagId, setTagId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('calf');
  const [gender, setGender] = useState<any>('F');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<any>('active');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Popula o formulário quando o animal é carregado
  useEffect(() => {
    if (animal) {
      setTagId(animal.tagId || '');
      setName(animal.name || '');
      setType(animal.type || 'calf');
      setGender(animal.gender || 'F');      
      setDateOfBirth(isoToDate(animal.dateOfBirth));
      // ... (outros campos preenchidos no handleCancelEdit)
    }
  }, [animal, locale]);

  const handleDelete = async () => {
    console.log('[AnimalProfile] handleDelete pressed for id=', id);

    // On web Alert.alert does not support callback buttons the same way as native.
    // Use a confirm fallback for web to ensure the deletion proceeds.
    if (Platform.OS === 'web') {
      try {
        const confirmed = typeof window !== 'undefined' ? window.confirm(t('animal.alert.deleteMessage')) : true;
        console.log('[AnimalProfile] web confirm result=', confirmed);
        if (!confirmed) return;

        console.log('[AnimalProfile] delete confirmed (web), calling mutateAsync');
        await deleteMutation.mutateAsync({ id: id! });
        console.log('[AnimalProfile] mutation returned (web), invalidating list');
        await trpcUtils.animal.list.invalidate();
        try { await deleteAnimalFromContext(id!); } catch (e) { console.warn('[AnimalProfile] deleteAnimalFromContext failed', e); }
        // router.back after success
        router.back();
        return;
      } catch (err) {
        console.error('Erro ao deletar animal (web):', err);
        Alert.alert(t('common.error'), t('animal.alert.deleteFailed'));
        return;
      }
    }

    // Native platforms: show confirmation alert with callback
    try {
      Alert.alert(
        t('animal.alert.deleteTitle'),
        t('animal.alert.deleteMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('[AnimalProfile] delete confirmed, calling mutateAsync');
                await deleteMutation.mutateAsync({ id: id! });
                console.log('[AnimalProfile] mutation returned, invalidating list');
                await trpcUtils.animal.list.invalidate();
                try { await deleteAnimalFromContext(id!); } catch (e) { console.warn('[AnimalProfile] deleteAnimalFromContext failed', e); }
                Alert.alert(t('common.success'), t('animal.alert.deleteSuccess'));
                router.back();
              } catch (err) {
                console.error('Erro ao deletar animal:', err);
                Alert.alert(t('common.error'), t('animal.alert.deleteFailed'));
              }
            },
          },
        ]
      );
    } catch (e) {
      console.error('[AnimalProfile] Alert.show failed', e);
    }
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!tagId.trim()) newErrors.tagId = t('animal.form.errors.tagIdRequired');
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updates = {
      tagId, name, type, gender, dateOfBirth: dateToISO(dateOfBirth), breed, color,
      weight: weight ? parseFloat(weight) : undefined,
      status, observations,
    };

    try {
      await updateMutation.mutateAsync({ id: id!, updates });
      await trpcUtils.animal.get.invalidate({ id: id! });
      await trpcUtils.animal.list.invalidate();
      setIsEditing(false); // Sai do modo de edição
      Alert.alert(t('common.success'), t('animal.form.alert.updateSuccess'));
    } catch (err: any) {
      console.error(err);
      Alert.alert(t('common.error'), err.message || t('animal.form.alert.updateFailed'));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reseta os campos do formulário para os valores originais do animal
    if (animal) {
      setTagId(animal.tagId || '');
      setName(animal.name || '');
      setType(animal.type || 'calf');
      setGender(animal.gender || 'F');
      setDateOfBirth(isoToDate(animal.dateOfBirth));
      setBreed(animal.breed || '');
      setColor(animal.color || '');
      setWeight(animal.weight?.toString() || '');
      setStatus(animal.status || 'active');
      setObservations(animal.observations || '');
      setErrors({});
    }
  };

  // Memoiza a data formatada
  const formattedDateOfBirth = useMemo(() => {
    if (!animal?.dateOfBirth) return 'N/A';
    return isoToDate(animal.dateOfBirth).toLocaleDateString(locale, {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
    });
  }, [animal?.dateOfBirth, locale]);

  if (isLoading) {
    return <View style={styles.centerFeed}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (error || !animal) {
    return (
      <View style={styles.centerFeed}>
        <Text style={styles.errorText}>{t('animal.notFound')}</Text>
        <Button title={t('common.back')} onPress={() => router.back()} />
      </View>
    );
  }

  // Componentes de Chip para o formulário de edição
  const renderTypeChips = () => {
    const types: any[] = ['calf', 'heifer', 'cow', 'steer', 'bull'];
    return (
      <View style={styles.chipContainer}>
        {types.map((t_option) => (
          <TouchableOpacity
            key={t_option}
            style={[styles.chip, type === t_option && styles.chipActive]}
            onPress={() => setType(t_option)}
          >
            <Text style={[styles.chipText, type === t_option && styles.chipTextActive]}>
              {t(`animal.type.${t_option}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStatusChips = () => {
    const statuses: any[] = ['active', 'for_sale', 'sold', 'deceased'];
    return (
      <View style={styles.chipContainer}>
        {statuses.map((s_option) => (
          <TouchableOpacity
            key={s_option}
            style={[styles.chip, status === s_option && styles.chipActive]}
            onPress={() => setStatus(s_option)}
          >
            <Text style={[styles.chipText, status === s_option && styles.chipTextActive]}>
              {t(`animal.status.${s_option}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isEditing ? t('animal.form.editTitle') : t('animal.profileTitle'),
          headerRight: () => {
            if (isEditing) {
              return (
                <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
                  <Text style={styles.headerButtonSave}>
                    {updateMutation.isPending ? t('common.loading') : t('common.save')}
                  </Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity onPress={handleDelete} style={{ marginRight: Spacing.sm }}>
                <Trash2 size={24} color={Colors.white} />
              </TouchableOpacity>
            );
          }
        }} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isEditing ? (
          // MODO DE EDIÇÃO
          <View style={styles.formContainer}>
            <Input label={t('animal.form.tagIdLabel')} value={tagId} onChangeText={setTagId} error={errors.tagId} />
            <Input label={t('animal.form.nameLabel')} value={name} onChangeText={setName} />            <DatePickerInput label={t('animal.form.dobLabel')} value={dateOfBirth} onChange={setDateOfBirth} error={errors.dateOfBirth} />
            
            <Text style={styles.label}>{t('animal.form.typeLabel')}</Text>
            {renderTypeChips()}

            <Text style={styles.label}>{t('animal.form.genderLabel')}</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity style={[styles.chip, gender === 'F' && styles.chipActive]} onPress={() => setGender('F')}>
                <Text style={[styles.chipText, gender === 'F' && styles.chipTextActive]}>{t('common.female')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.chip, gender === 'M' && styles.chipActive]} onPress={() => setGender('M')}>
                <Text style={[styles.chipText, gender === 'M' && styles.chipTextActive]}>{t('common.male')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('animal.form.statusLabel')}</Text>
            {renderStatusChips()}

            <Input label={t('animal.form.breedLabel')} value={breed} onChangeText={setBreed} />
            <Input label={t('animal.form.colorLabel')} value={color} onChangeText={setColor} />
            <Input label={t('animal.form.weightLabel')} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="kg" />
            <Input label={t('common.notes')} value={observations} onChangeText={setObservations} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: 'top' }} />
          </View>
        ) : (
          // MODO DE VISUALIZAÇÃO
          <>
            <View style={styles.header}>
              {animal.imageUri ? (
                <Image source={{ uri: animal.imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>{animal.tagId.substring(0, 2)}</Text>
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={styles.tagId}>#{animal.tagId}</Text>
                {animal.name && <Text style={styles.name}>{animal.name}</Text>}
              </View>
            </View>

            <Text style={styles.sectionTitle}>{t('animal.details.title')}</Text>
            <View style={styles.detailsContainer}>
              <DetailItem 
                icon={<Calendar size={20} color={Colors.textLight} />}
                label={t('animal.form.dobLabel')}
                value={formattedDateOfBirth}
                isHighlight
              />
              <DetailItem
                icon={<Feather size={20} color={Colors.textLight} />}
                label={t('animal.form.genderLabel')}
                value={animal.gender === 'M' ? t('common.male') : t('common.female')}
                isHighlight
              />
              <DetailItem
                icon={<Tag size={20} color={Colors.textLight} />}
                label={t('animal.form.typeLabel')}
                value={t(`animal.type.${animal.type}`)}
                isHighlight
              />
              {animal.breed && (
                <DetailItem 
                  icon={<Tag size={20} color={Colors.textLight} />}
                  label={t('animal.form.breedLabel')}
                  value={animal.breed}
                />
              )}
              {animal.color && (
                <DetailItem 
                  icon={<Palette size={20} color={Colors.textLight} />}
                  label={t('animal.form.colorLabel')}
                  value={animal.color}
                />
              )}
              {animal.weight && (
                <DetailItem 
                  icon={<Weight size={20} color={Colors.textLight} />}
                  label={t('animal.form.weightLabel')}
                  value={`${animal.weight} kg`}
                />
              )}
            </View>

            <Text style={styles.sectionTitle}>{t('animal.navigation.title')}</Text>
            <View style={styles.navContainer}>
              <NavButton
                icon={<HeartPulse size={24} color={Colors.primary} />}
                title={t('health.recordsTitle')}
                onPress={() => router.push(`/animal/${id}/health`)}
              />
              <NavButton
                icon={<Users size={24} color={Colors.primary} />}
                title={t('animal.descendantsTitle')}
                onPress={() => router.push(`/animal/${id}/descendant`)}
              />
            </View>
            
            {animal.observations && (
              <>
                <Text style={styles.sectionTitle}>{t('common.notes')}</Text>
                <View style={styles.notesContainer}>
                  <Text style={styles.notesText}>{animal.observations}</Text>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isEditing ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonHalf}>
              <Button
                title={t('common.cancel')}
                onPress={handleCancelEdit}
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
          <Button title={t('animal.form.editButton')} onPress={() => setIsEditing(true)} />
        )}
      </View>
    </View>
  );
}

// --- Componentes Internos ---

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isHighlight?: boolean;
}

function DetailItem({ icon, label, value, isHighlight = false }: DetailItemProps) {
  return (
    <View style={[styles.detailItem, isHighlight && styles.detailItemHighlight]}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}

function NavButton({ icon, title, onPress }: NavButtonProps) {
  return (
    <TouchableOpacity style={styles.navButton} onPress={onPress}>
      <View style={styles.navIcon}>{icon}</View>
      <Text style={styles.navTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

// --- Estilos ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  headerButtonSave: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  header: {
    backgroundColor: Colors.cardBackground,
    padding: Spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: Spacing.md,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  imagePlaceholderText: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  headerText: {
    alignItems: 'center',
  },
  tagId: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  name: {
    fontSize: FontSize.lg,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  detailsContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailItemHighlight: {
    paddingVertical: Spacing.lg,
  },
  detailIcon: {
    marginRight: Spacing.md,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  navContainer: {
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  navTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  notesContainer: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  notesText: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  formContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.round,
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
    color: Colors.text,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: FontWeight.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  buttonHalf: {
    flex: 1,
  },
});