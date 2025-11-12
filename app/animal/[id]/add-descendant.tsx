import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Calendar, Search } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { Button } from '@/components/Button';
import { Animal } from '@/types/models';

// 1. Importar a função 't'
import { t } from '@/lib/i18n';

export default function AddDescendantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { animals, addDescendant, getAnimalById } = useHerd();
  
  const parent = getAnimalById(id!);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationship, setRelationship] = useState<'mother' | 'father'>('mother');

  const filteredAnimals = animals.filter(animal => {
    if (animal.id === id) return false;
    const matchesSearch = 
      searchQuery === '' ||
      animal.tagId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return matchesSearch;
  });

  const handleSave = async () => {
    // 2. Usar 't' para alertas
    if (!selectedChildId) {
      Alert.alert(t('common.error'), t('animal.alert.selectDescendant'));
      return;
    }

    try {
      await addDescendant(id!, selectedChildId, relationship);
      router.back();
    } catch (error) {
      console.error('Error adding descendant:', error);
      Alert.alert(t('common.error'), t('animal.alert.addDescendantFailed'));
    }
  };

  if (!parent) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          {/* 3. Usar 't' para erro */}
          <Text style={styles.emptyText}>{t('animal.parentNotFound')}</Text>
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
        {/* 4. Usar 't' para o header */}
        <Text style={styles.headerTitle}>{t('animal.addDescendantTitle')}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('animal.parentAnimal')}</Text>
            <View style={styles.parentCard}>
              <Text style={styles.parentId}>#{parent.tagId}</Text>
              {parent.name && <Text style={styles.parentName}>{parent.name}</Text>}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('animal.relationship')} *</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[styles.chip, relationship === 'mother' && styles.chipActive]}
                onPress={() => setRelationship('mother')}
              >
                <Text style={[styles.chipText, relationship === 'mother' && styles.chipTextActive]}>
                  {t('animal.relationshipMother')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, relationship === 'father' && styles.chipActive]}
                onPress={() => setRelationship('father')}
              >
                <Text style={[styles.chipText, relationship === 'father' && styles.chipTextActive]}>
                  {t('animal.relationshipFather')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('animal.selectDescendant')} *</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('common.searchByIdOrName')}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.animalList}>
            {filteredAnimals.length > 0 ? (
              filteredAnimals.map((animal) => (
                <TouchableOpacity
                  key={animal.id}
                  style={[
                    styles.animalCard,
                    selectedChildId === animal.id && styles.animalCardSelected,
                  ]}
                  onPress={() => setSelectedChildId(animal.id)}
                >
                  <View style={styles.animalInfo}>
                    <Text style={styles.animalId}>#{animal.tagId}</Text>
                    {animal.name && <Text style={styles.animalName}>{animal.name}</Text>}
                    <Text style={styles.animalDetail}>
                      {animal.type} • {animal.gender === 'M' ? t('common.male') : t('common.female')}
                    </Text>
                  </View>
                  {selectedChildId === animal.id && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyListText}>{t('animal.noAnimalsFound')}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={t('animal.saveDescendantButton')} onPress={handleSave} />
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
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
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
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textLight,
  },
  parentCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  parentId: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  parentName: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  chip: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  animalList: {
    gap: Spacing.sm,
  },
  animalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  animalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  animalInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  animalId: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  animalName: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
  animalDetail: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
  },
  emptyListText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.xl,
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