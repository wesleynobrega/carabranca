// app/animal/add.tsx (CORRIGIDO)

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon } from 'lucide-react-native';
import React, { useState } from 'react'; // 1. Importar useMemo
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { DatePickerInput } from '@/components/DatePickerInput';
import { Input } from '@/components/Input';
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { t } from '@/lib/i18n';
import { Animal } from '@/types/models';

// Converte um objeto Date para o formato 'AAAA-MM-DD'
const dateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export default function AddAnimalScreen() {
  const router = useRouter();
  // 2. CORREÇÃO: Pegar o 'locale' do contexto
  const { addAnimal, locale } = useHerd(); 
  const insets = useSafeAreaInsets();

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

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validação simples
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!tagId.trim()) newErrors.tagId = t('animal.form.errors.tagIdRequired');
    // A validação de formato real acontecerá no 'handleSave'
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lógica de seleção de imagem (sem alterações)
  const pickImage = async (useCamera: boolean) => {
    // ... (seu código de pickImage)
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('animal.form.errors.cameraPermission'));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
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

  // 5. CORREÇÃO: Lógica de salvamento atualizada
  const handleSave = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      const newAnimal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
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
      };

      await addAnimal(newAnimal as any);
      setIsLoading(false);
      Alert.alert(t('common.success'), t('animal.form.alert.addSuccess'));
      router.back();

    } catch (err) {
      setIsLoading(false);
      console.error(err);
      Alert.alert(t('common.error'), t('animal.form.alert.addFailed'));
    }
  };

  // ... (renderTypeChips - Sem alterações) ...
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

  // 7. CORREÇÃO: Renderização dos chips de Status
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


  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }}
    >
      <View style={styles.content}>
        {/* Seção de Upload de Imagem (sem alterações) */}
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
          
          {/* 9. CORREÇÃO: Chips de Status adicionados */}
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

          <Button
            title={t('animal.form.saveButton')}
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading}
            size="large"
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

// Estilos (sem alterações)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
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
    right: '30%', // Ajustar para centralizar
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