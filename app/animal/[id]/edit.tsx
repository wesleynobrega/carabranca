import { useEffect, useState } from 'react';
import {
  ActivityIndicator // 1. Importar ActivityIndicator
  ,





  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// 2. Importar Stack e useLocalSearchParams
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
// 3. Remover useSafeAreaInsets (não é mais necessário se usarmos Stack.Screen)
import { useQueryClient } from '@tanstack/react-query'; // 4. Importar useQueryClient
import * as ImagePicker from 'expo-image-picker';
import { AlertCircle, Camera, Image as ImageIcon } from 'lucide-react-native';

import { Button } from '@/components/Button';
import { DatePickerInput } from '@/components/DatePickerInput';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext'; // 5. Puxar o 'locale'
import { t } from '@/lib/i18n';
import { trpc } from '@/lib/trpc'; // 6. Importar trpc
import { Animal } from '@/types/models';

// --- HELPER DE DATA (Para corrigir o Bug 3) ---
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
// --- FIM DOS HELPERS ---


export default function EditAnimalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // 7. Usar os hooks de tRPC DIRETAMENTE (substitui getAnimalById, updateAnimal)
  const queryClient = useQueryClient();
  // Busca os dados do animal via tRPC
  const { data: animal, isLoading: isLoadingAnimal } = trpc.animal.get.useQuery({ id: id! });
  // Prepara a mutação tRPC
  const updateMutation = trpc.animal.update.useMutation();
  // trpc utils para invalidar queries de forma segura
  const trpcUtils = trpc.useContext();
  
  const { locale } = useHerd(); // Apenas para o 'locale'

  // Estados do formulário
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [tagId, setTagId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Animal['type']>('calf');
  const [gender, setGender] = useState<Animal['gender']>('F');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [breed, setBreed] = useState('');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<Animal['status']>('active');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tagId.trim()) newErrors.tagId = t('animal.form.errors.tagIdRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 9. Efeito para popular o formulário QUANDO o animal carregar
  useEffect(() => {
    if (animal) {
      setImageUri(animal.imageUri);
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
    }
  }, [animal]); // Roda quando 'animal' ou 'locale' mudam

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('animal.form.errors.cameraPermission'));
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('animal.form.errors.galleryPermission'));
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
    }

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 
  // =================================================================
  // FLUXO DE SALVAR (REQUISITOS 1, 2 e 3)
  // =================================================================
  //
  const handleSave = async () => {
    if (!validate()) return;
    
    const updates: Partial<Animal> = {
      tagId,
      name: name || undefined,
      type,
      gender,
      dateOfBirth: dateToISO(dateOfBirth),
      breed: breed || undefined,
      color: color || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      status,
      imageUri: imageUri || undefined,
      observations: observations || undefined,
    };

    try {
      // 1. **SALVAR:** Chama a mutação tRPC
      await updateMutation.mutateAsync({
        id: id!,
        updates: updates,
      });

  // 2. **ATUALIZAR TELA ANTERIOR:** Invalida o cache via trpc utils (mais seguro)
  await trpcUtils.animal.get.invalidate({ id: id! });
  await trpcUtils.animal.list.invalidate();

      Alert.alert(t('common.success'), t('animal.form.alert.updateSuccess'));
      
      // 3. **FECHAR O MODAL:**
      router.back(); 

    } catch (err: any) {
      console.error(err);
      Alert.alert(t('common.error'), err.message || t('animal.form.alert.updateFailed'));
    }
  };

  // ... (renderTypeChips, renderStatusChips - sem alteração) ...
  const renderTypeChips = () => {
    const types: Animal['type'][] = ['calf', 'heifer', 'cow', 'steer', 'bull'];
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
    const statuses: Animal['status'][] = ['active', 'for_sale', 'sold', 'deceased'];
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
  
  if (isLoadingAnimal) {
    return (
      <View style={styles.centerFeed}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!animal) {
     return (
      <View style={styles.centerFeed}>
        <AlertCircle size={48} color={Colors.error} />
        <Text style={styles.notFoundText}>{t('animal.notFound')}</Text>
        <Button title={t('common.back')} onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* **HEADER CORRIGIDO (REQUISITO 2):** */}
      <Stack.Screen 
        options={{ 
          presentation: 'modal', 
          title: t('animal.form.editTitle'),
          // Header da direita (Salvar)
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} disabled={updateMutation.isPending}>
              <Text style={[styles.headerButton, styles.headerButtonSave]}>
                {/* Mostra "Salvando..." enquanto a mutação está ocorrendo */}
                {updateMutation.isPending ? t('common.loading') : t('common.save')}
              </Text>
            </TouchableOpacity>
          ),
          // Header da esquerda (botão de fechar nativo)
          // Removido o "Cancelar" feio. O Expo Router usará o padrão 
          // (seta para baixo no iOS, "X" ou seta "voltar" no Android).
          headerLeft: () => (
            Platform.OS === 'ios' ? (
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.headerButton}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            ) : null
          )
        }} 
      />

      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: Spacing.lg }}
      >
        <View style={styles.content}>
          {/* Seção de Upload de Imagem (sem alteração) */}
          <View style={styles.imagePickerContainer}>
            <TouchableOpacity 
              style={styles.imagePreview} 
              onPress={() => pickImage(false)}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <ImageIcon size={48} color={Colors.textMuted} />
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => pickImage(true)}
            >
              <Camera size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
            <Input
              label={t('animal.form.tagIdLabel')}
              placeholder={t('animal.form.tagIdPlaceholder')}
              value={tagId}
              onChangeText={setTagId}
              error={errors.tagId}
            />
            <Input
              label={t('animal.form.nameLabel')}
              placeholder={t('animal.form.namePlaceholder')}
              value={name}
              onChangeText={setName}
            />
            <DatePickerInput
              label={t('animal.form.dobLabel')}
              value={dateOfBirth}
              onChange={setDateOfBirth}
              error={errors.dateOfBirth}
            />
            
            <Text style={styles.label}>{t('animal.form.typeLabel')}</Text>
            {renderTypeChips()}

            <Text style={styles.label}>{t('animal.form.genderLabel')}</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                  style={[styles.chip, gender === 'F' && styles.chipActive]}
                  onPress={() => setGender('F')}
                >
                  <Text style={[styles.chipText, gender === 'F' && styles.chipTextActive]}>{t('common.female')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.chip, gender === 'M' && styles.chipActive]}
                  onPress={() => setGender('M')}
                >
                  <Text style={[styles.chipText, gender === 'M' && styles.chipTextActive]}>{t('common.male')}</Text>
                </TouchableOpacity>
            </View>
            
            <Text style={styles.label}>{t('animal.form.statusLabel')}</Text>
            {renderStatusChips()}

            <Input
              label={t('animal.form.breedLabel')}
              placeholder={t('animal.form.breedPlaceholder')}
              value={breed}
              onChangeText={setBreed}
            />
            <Input
              label={t('animal.form.colorLabel')}
              placeholder={t('animal.form.colorPlaceholder')}
              value={color}
              onChangeText={setColor}
            />
            <Input
              label={t('animal.form.weightLabel')}
              placeholder="kg"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />
            <Input
              label={t('common.notes')}
              placeholder={t('common.notesPlaceholderObservations')}
              value={observations}
              onChangeText={setObservations}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            {/* Este botão é opcional, mas útil para formulários longos */}
            <Button
              title={t('animal.form.saveButton')}
              onPress={handleSave}
              loading={updateMutation.isPending}
              disabled={updateMutation.isPending}
              size="large"
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ... (Estilos - adaptados do add.tsx) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
  },
  centerFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerButton: {
    fontSize: FontSize.md,
    color: Colors.white,
    paddingHorizontal: Spacing.sm,
  },
  headerButtonSave: {
    fontWeight: FontWeight.bold,
  },
  notFoundText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  imagePreview: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%', 
    backgroundColor: Colors.primary,
    padding: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  form: {
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
});