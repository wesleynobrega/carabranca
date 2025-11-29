// 1. CORREÇÃO: Adicionado 'useMemo' à importação do React
import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useFilteredAnimals, useHerd } from '@/contexts/HerdContext';
import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Animal, AnimalFilter } from '../../../types/models.js';

import { t } from '@/lib/i18n';

// Filtros agora usam 't()'
const FILTERS: { labelKey: string; value: AnimalFilter }[] = [
  { labelKey: 'animal.filter.all', value: 'all' },
  { labelKey: 'animal.filter.adults', value: 'cow' },
  { labelKey: 'animal.filter.calves', value: 'calf' },
  { labelKey: 'animal.filter.forSale', value: 'for_sale' },
];

export default function HerdScreen() {
  const router = useRouter();
  const { filter, setFilter, searchQuery, setSearchQuery, isLoading } = useHerd();
  const filteredAnimals = useFilteredAnimals();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('tabs.herd')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              style={styles.iconButton}
            >
              <Search size={24} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/animal/add')}
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
              placeholder={t('common.searchByIdOrName')}
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
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Mostra o loading principal se os animais ainda não carregaram */}
      {isLoading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyTitle}>{t('common.loading')}</Text>
        </View>
      ) : filteredAnimals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('animal.empty.herdTitle')}</Text>
          <Text style={styles.emptyText}>
            {searchQuery || filter !== 'all'
              ? t('animal.empty.noResults')
              : t('animal.empty.herdSubtitle')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnimalCard animal={item} onPress={() => router.push(`/animal/${item.id}`)} />}
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
  const { locale } = useHerd();

  // 2. 'useMemo' agora está definido
  const ageString = useMemo(() => {
    try {
      const [year, month, day] = animal.dateOfBirth.split('-').map(Number);
      const birthDate = new Date(year, month - 1, day);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
      }
      
      if (years > 1) {
        return `${years} ${t('common.yearPlural')}`;
      }
      if (years === 1) {
        return `1 ${t('common.yearSingular')}`;
      }
      if (months > 1) {
        return `${months} ${t('common.monthPlural')}`;
      }
      // Adiciona o caso de 1 mês ou 0 meses
      if (months === 1) {
         return `1 ${t('common.monthSingular')}`;
      }
      return `< 1 ${t('common.monthSingular')}`; // Menos de 1 mês

    } catch (e) {
      return 'N/A';
    }
  }, [animal.dateOfBirth, locale]); // Depende do locale para recarregar as traduções

  const getStatusColor = (status: Animal['status']) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'for_sale': return Colors.warning;
      case 'sold': return Colors.info;
      case 'deceased': return Colors.error;
      default: return Colors.textMuted;
    }
  };

  // Código defensivo
  const tagId = animal.tagId || "";
  const name = animal.name;
  const imageUri = animal.imageUri;
  const status = animal.status || "active";
  const type = animal.type || "calf";
  const gender = animal.gender || "F";

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: Colors.primaryLight + '20' }]}>
            <Text style={styles.imagePlaceholderText}>{tagId.substring(0, 2)}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>#{tagId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
              {t(`animal.status.${status}`)}
            </Text>
          </View>
        </View>
        {name && <Text style={styles.cardName}>{name}</Text>}
        <View style={styles.cardDetails}>
          <Text style={styles.cardDetailText}>{t(`animal.type.${type}`)}</Text>
          <Text style={styles.cardDetailText}>•</Text>
          <Text style={styles.cardDetailText}>{ageString}</Text>
          <Text style={styles.cardDetailText}>•</Text>
          <Text style={styles.cardDetailText}>{gender === 'M' ? t('common.male') : t('common.female')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ... (Estilos - sem alterações) ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.lg,
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