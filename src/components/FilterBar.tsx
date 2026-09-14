import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Row } from '@/design-system/components';
import { spacing } from '@/design-system/tokens';
import { DISCOVER_FILTER_TAGS, tagLabel } from '@/data/tags';
import type { MealType } from '@/types/recipe';
import type { RecipeFilter } from '@/domain/filters';

const MEALS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Frühstück' },
  { id: 'lunch', label: 'Mittagessen' },
  { id: 'dinner', label: 'Abendessen' },
  { id: 'snack', label: 'Snack' },
  { id: 'dessert', label: 'Dessert' },
];

export function FilterBar({
  filter,
  onChange,
  onOpenMood,
}: {
  filter: RecipeFilter;
  onChange: (f: RecipeFilter) => void;
  onOpenMood: () => void;
}) {
  const toggleMeal = (m: MealType) =>
    onChange({ ...filter, mealTypes: filter.mealTypes.includes(m) ? filter.mealTypes.filter((x) => x !== m) : [...filter.mealTypes, m] });
  const toggleTag = (t: string) =>
    onChange({ ...filter, tags: filter.tags.includes(t) ? filter.tags.filter((x) => x !== t) : [...filter.tags, t] });

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
        <Chip label={filter.moods.length ? `Wonach ist mir? · ${filter.moods.length}` : 'Wonach ist mir?'} selected={filter.moods.length > 0} onPress={onOpenMood} />
        <View style={styles.sep} />
        {MEALS.map((m) => (
          <Chip key={m.id} label={m.label} selected={filter.mealTypes.includes(m.id)} onPress={() => toggleMeal(m.id)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rowContent}>
        {DISCOVER_FILTER_TAGS.map((t) => (
          <Chip key={t} label={tagLabel(t)} small selected={filter.tags.includes(t)} onPress={() => toggleTag(t)} />
        ))}
      </ScrollView>
    </View>
  );
}

export function ActiveFilterSummary({ filter, onClear }: { filter: RecipeFilter; onClear: () => void }) {
  const n = filter.mealTypes.length + filter.tags.length + filter.moods.length + (filter.maxTotalMinutes ? 1 : 0);
  if (!n) return null;
  return (
    <Row style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xs }}>
      <Chip label={`${n} Filter aktiv · zurücksetzen`} small onPress={onClear} />
    </Row>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  rowContent: { paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  sep: { width: 1, height: 20, backgroundColor: '#E4E4E4', marginHorizontal: 4 },
});
