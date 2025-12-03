// app/animal/[id]/descendant.tsx (COMPLETO E CORRIGIDO)

import { BorderRadius, Colors, FontSize, FontWeight, Spacing } from '@/constants/colors';
import { useHerd } from '@/contexts/HerdContext';
import i18n, { t } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Helper para formatar datas no formato AAAA-MM-DD ou ISO
function formatLocalDate(isoOrDate?: string, locale?: string) {
  if (!isoOrDate) return 'N/A';
  try {
    const loc = locale || (typeof (Intl) !== 'undefined' ? undefined : undefined);
    // Caso seja no formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDate)) {
      const [year, month, day] = isoOrDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString(locale || undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    // Tenta criar a Date normalmente (para ISO com time, etc.)
    const parsed = new Date(isoOrDate);
    if (isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString(locale || undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return 'N/A';
  }
}

export default function DescendantsListScreen() {
  const { id: parentId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getAnimalById } = useHerd();
  
  const parent = getAnimalById(parentId!);

  const { 
    data: children = [], 
    isLoading, 
    refetch 
  } = trpc.descendant.list.useQuery(
    { parentId: parentId! },
    { enabled: !!parentId }
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  if (isLoading && !parent) {
    return (
      <View style={[styles.container, styles.emptyState]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!parent) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
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
          <Text style={styles.headerTitle}>{t('animal.descendantsTitle')}</Text>
          <Text style={styles.headerSubtitle}>#{parent.tagId} {parent.name ? `- ${parent.name}` : ''}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : children.length > 0 ? (
          <View style={styles.descendantsList}>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={styles.descendantCard}
                onPress={() => router.push(`/animal/${child.id}` as any)}
              >
                <View style={styles.descendantInfo}>
                  <View style={styles.descendantHeader}>
                    {/* ✅ CORREÇÃO DE EXIBIÇÃO: Prioriza tagId, mas usa nome como fallback. */}
                    <Text style={styles.descendantId}>
                      {child.tagId ? `#${child.tagId}` : (child.name || t('common.error'))}
                    </Text>
                    {child.name && child.tagId && <Text style={styles.descendantName}>{child.name}</Text>}
                  </View>
                  <View style={styles.descendantDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('animal.dob')}:</Text>
                      <Text style={styles.detailValue}>
                        {formatLocalDate(child.dateOfBirth, i18n.currentLocale())}
                      </Text>
                    </View>
                    
                    {/* ✅ CORREÇÃO ADICIONADA: Bloco de Sexo (Gender) estava faltando na listagem */}
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('animal.gender')}:</Text>
                      <Text style={styles.detailValue}>
                        {child.gender === 'M' ? t('common.male') : t('common.female')}
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('animal.type')}:</Text>
                      {/* ✅ CORREÇÃO: Usar a tradução correta para o tipo de animal */}
                      <Text style={styles.detailValue}>{t(`animal.type.${child.type}` as any)}</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyListState}>
            <Text style={styles.emptyListText}>{t('animal.empty.descendantsTitle')}</Text>
            <Text style={styles.emptyListSubtext}>
              {t('animal.empty.descendantsSubtitle')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/animal/${parentId}/add-descendant` as any)}
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