import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Plus, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import { Animal } from '@/types/models';

// 1. Importar i18n e t
import i18n, { t } from '@/lib/i18n';

export default function DescendantsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { animals, getAnimalById } = useHerd();
  
  const parent = getAnimalById(id!);
  const children = animals.filter(a => a.motherId === id || a.fatherId === id);

  if (!parent) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          {/* 2. Usar 't' para erro */}
          <Text style={styles.emptyText}>{t('animal.notFound')}</Text>
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
          {/* 3. Usar 't' para o header */}
          <Text style={styles.headerTitle}>{t('animal.descendantsTitle')}</Text>
          <Text style={styles.headerSubtitle}>#{parent.tagId} {parent.name ? `- ${parent.name}` : ''}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {children.length > 0 ? (
          <View style={styles.descendantsList}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.descendantCard}
                onPress={() => router.push(`/animal/${child.id}` as any)}
              >
                <View style={styles.descendantInfo}>
                  <View style={styles.descendantHeader}>
                    <Text style={styles.descendantId}>#{child.tagId}</Text>
                    {child.name && <Text style={styles.descendantName}>{child.name}</Text>}
                  </View>
                  <View style={styles.descendantDetails}>
                    <View style={styles.detailItem}>
                      {/* 4. Usar 't' para os detalhes */}
                      <Text style={styles.detailLabel}>{t('animal.dob')}:</Text>
                      <Text style={styles.detailValue}>
                        {/* 5. Usar o locale do i18n */}
                        {new Date(child.dateOfBirth).toLocaleDateString(i18n.currentLocale())}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('animal.gender')}:</Text>
                      <Text style={styles.detailValue}>
                        {child.gender === 'M' ? t('common.male') : t('common.female')}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('animal.type')}:</Text>
                      <Text style={styles.detailValue}>{child.type}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyListState}>
            {/* 6. Usar 't' para o estado de lista vazia */}
            <Text style={styles.emptyListText}>{t('animal.empty.descendantsTitle')}</Text>
            <Text style={styles.emptyListSubtext}>
              {t('animal.empty.descendantsSubtitle')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/animal/${id}/add-descendant` as any)}
      >
        <Plus size={28} color={Colors.white} />
      </TouchableOpacity>
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
    paddingBottom: 100,
  },
  descendantsList: {
    gap: Spacing.md,
  },
  descendantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descendantInfo: {
    flex: 1,
    gap: Spacing.md,
  },
  descendantHeader: {
    gap: Spacing.xs,
  },
  descendantId: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  descendantName: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  descendantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: FontWeight.medium,
  },
  emptyListState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyListText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  emptyListSubtext: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 60,
    height: 60,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  },
});
