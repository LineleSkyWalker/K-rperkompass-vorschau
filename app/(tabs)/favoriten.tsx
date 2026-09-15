import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Chip, EmptyState, Screen, Text } from '@/design-system/components';
import { colors, radius, semantic, shadows, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { BrandHeader } from '@/components/BrandHeader';
import { RecipeImage } from '@/components/RecipeImage';
import type { Recipe } from '@/types/recipe';

type FavFilter = 'all' | 'breakfast' | 'main' | 'snack' | 'dessert' | 'quick' | 'vegetarian' | 'recent' | 'cooked';

const FILTERS: { id: FavFilter; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'recent', label: 'zuletzt gespeichert' },
  { id: 'cooked', label: 'häufig gekocht' },
  { id: 'breakfast', label: 'Frühstück' },
  { id: 'main', label: 'Hauptgericht' },
  { id: 'snack', label: 'Snack' },
  { id: 'dessert', label: 'Dessert' },
  { id: 'quick', label: 'schnell' },
  { id: 'vegetarian', label: 'vegetarisch' },
];

export default function FavoritesScreen() {
  const { data, recipeById, toggleFavorite } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FavFilter>('all');

  const favorites = useMemo(() => {
    let list = data.favorites.map((id) => recipeById.get(id)).filter((r): r is Recipe => Boolean(r));
    switch (filter) {
      case 'breakfast':
        list = list.filter((r) => r.mealTypes.includes('breakfast'));
        break;
      case 'main':
        list = list.filter((r) => r.mealTypes.includes('lunch') || r.mealTypes.includes('dinner'));
        break;
      case 'snack':
        list = list.filter((r) => r.mealTypes.includes('snack'));
        break;
      case 'dessert':
        list = list.filter((r) => r.mealTypes.includes('dessert'));
        break;
      case 'quick':
        list = list.filter((r) => r.totalTimeMinutes <= 30);
        break;
      case 'vegetarian':
        list = list.filter((r) => r.tags.includes('vegetarian') || r.tags.includes('vegan'));
        break;
      case 'cooked':
        list = [...list].sort((a, b) => (data.cookedCount[b.id] ?? 0) - (data.cookedCount[a.id] ?? 0));
        break;
      default:
        break; // 'all' und 'recent' = Reihenfolge der Speicherung (neueste zuerst)
    }
    return list;
  }, [data.favorites, data.cookedCount, recipeById, filter]);

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <BrandHeader title="Favoriten" subtitle={`${data.favorites.length} gespeichert`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} small selected={filter === f.id} onPress={() => setFilter(f.id)} />
        ))}
      </ScrollView>

      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title={data.favorites.length === 0 ? 'Noch keine Favoriten' : 'Nichts in dieser Auswahl'}
          text={
            data.favorites.length === 0
              ? 'Wische im Entdecken-Bereich nach rechts oder tippe auf das Herz – hier sammelst du, was dir gefällt.'
              : 'Probier einen anderen Filter.'
          }
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(r) => r.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md }}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.tile, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={item.title}
            >
              <View style={styles.tileImage}>
                <RecipeImage recipe={item} iconSize={36} />
                <Pressable
                  onPress={() => toggleFavorite(item.id)}
                  hitSlop={8}
                  style={styles.heart}
                  accessibilityLabel="Aus Favoriten entfernen"
                >
                  <Ionicons name="heart" size={16} color={colors.brand.turquoise} />
                </Pressable>
              </View>
              <View style={{ padding: spacing.md }}>
                <Text variant="label" numberOfLines={2}>
                  {item.title}
                </Text>
                <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  {item.totalTimeMinutes} Min.
                  {data.cookedCount[item.id] ? ` · ${data.cookedCount[item.id]}× gekocht` : ''}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  filters: { paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm },
  tile: { flex: 1, backgroundColor: semantic.surface, borderRadius: radius.lg, overflow: 'hidden', ...shadows.soft },
  tileImage: { height: 120 },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: semantic.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
