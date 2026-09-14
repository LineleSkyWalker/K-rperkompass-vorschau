import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '@/types/recipe';
import { Row, Tag, Text } from '@/design-system/components';
import { radius, semantic, shadows, spacing } from '@/design-system/tokens';
import { tagLabel } from '@/data/tags';
import { RecipeImage } from './RecipeImage';

const CARD_TAG_PRIORITY = ['vegan', 'vegetarian', 'under_15_min', 'under_30_min', 'family_friendly', 'comfort_food', 'creamy', 'crispy', 'fresh', 'warm', 'sweet', 'savory', 'meal_prep', 'budget', 'protein_rich', 'fiber_rich', 'omega3_source'];

export function pickCardTags(recipe: Recipe, max = 4): string[] {
  const set = new Set(recipe.tags);
  const out: string[] = [];
  for (const t of CARD_TAG_PRIORITY) {
    if (set.has(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/** Große Rezeptkarte für den Entdecken-Stapel. */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const tags = pickCardTags(recipe);
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <RecipeImage recipe={recipe} iconSize={72} />
      </View>
      <View style={styles.body}>
        <Text variant="h2" numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text variant="bodySmall" tone="secondary" numberOfLines={2} style={{ marginTop: spacing.xs }}>
          {recipe.shortDescription}
        </Text>
        <Row style={{ marginTop: spacing.md }} gap={spacing.lg}>
          <Row gap={4}>
            <Ionicons name="time-outline" size={16} color={semantic.textSecondary} />
            <Text variant="label" tone="secondary">
              {recipe.totalTimeMinutes} Min.
            </Text>
          </Row>
          <Row gap={4}>
            <Ionicons name="people-outline" size={16} color={semantic.textSecondary} />
            <Text variant="label" tone="secondary">
              {recipe.defaultServings} {recipe.defaultServings === 1 ? 'Portion' : 'Portionen'}
            </Text>
          </Row>
        </Row>
        <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }} gap={6}>
          {tags.map((t) => (
            <Tag key={t} label={tagLabel(t)} />
          ))}
        </Row>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: semantic.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageWrap: { flex: 1, minHeight: 200 },
  body: { padding: spacing.lg, paddingBottom: spacing.xl },
});
