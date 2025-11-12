import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Plus, Filter } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd, useFilteredAnimals } from '@/contexts/HerdContext';
import { Animal, AnimalFilter } from '@/types/models';

import { t } from '@/lib/i18n';

const FILTERS: { label: string; value: AnimalFilter }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Adultos', value: 'cow' },
  { label: 'Filhos', value: 'calf' },
  { label: 'À Venda', value: 'for_sale' },
];

export default function HerdScreen() {
  const router = useRouter();
  const { filter, setFilter, searchQuery, setSearchQuery } = useHerd();
  const filteredAnimals = useFilteredAnimals();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>My Herd</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.iconButton}
            >
              <Search size={24} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/animal/add' as any)}
              style={styles.iconButton}
            >
              <Plus size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por ID ou nome..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        <View style={styles.filterContainer}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
            >
              <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filteredAnimals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('animal.empty.title')}</Text>
          <Text style={styles.emptyText}>
            {searchQuery || filter !== 'all'
              ? 'Tente ajustar sua busca ou filtros'
              : 'Adicione seu primeiro animal para começar'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimalCard animal={item} onPress={() => router.push(`/animal/${item.id}` as any)} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

interface AnimalCardProps {
  animal: Animal;
  onPress: () => void;
}

function AnimalCard({ animal, onPress }: AnimalCardProps) {
  const age = Math.floor(
    (Date.now() - new Date(animal.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  const getStatusColor = (status: Animal['status']) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'for_sale': return Colors.warning;
      case 'sold': return Colors.info;
      case 'deceased': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardImage}>
        {animal.imageUri ? (
          <Image source={{ uri: animal.imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: Colors.primaryLight + '20' }]}>
            <Text style={styles.imagePlaceholderText}>{animal.tagId.substring(0, 2)}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>#{animal.tagId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(animal.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(animal.status) }]}>
              {animal.status.replace('_', ' ')}
            </Text>
          </View>
        </View>
        {animal.name && <Text style={styles.cardName}>{animal.name}</Text>}
        <View style={styles.cardDetails}>
          <Text style={styles.cardDetailText}>{animal.type}</Text>
          <Text style={styles.cardDetailText}>•</Text>
          <Text style={styles.cardDetailText}>{age} years</Text>
          <Text style={styles.cardDetailText}>•</Text>
          <Text style={styles.cardDetailText}>{animal.gender === 'M' ? 'Macho' : 'Fêmea'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white + '20',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 4,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.white + '20',
  },
  filterChipActive: {
    backgroundColor: Colors.white,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.white,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: 100,
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  cardContent: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardId: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    textTransform: 'capitalize',
  },
  cardName: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
  cardDetails: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cardDetailText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
