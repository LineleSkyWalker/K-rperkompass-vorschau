import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '@/types/recipe';
import { Row, Text } from '@/design-system/components';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
import { tagLabel } from '@/data/tags';
import { RecipeImage } from './RecipeImage';

const CARD_TAG_PRIORITY = ['vegan', 'vegetarian', 'under_15_min', 'under_30_min', 'family_friendly', 'comfort_food', 'creamy', 'crispy', 'fresh', 'warm', 'sweet', 'savory', 'meal_prep', 'budget', 'protein_rich', 'fiber_rich', 'omega3_source'];

export function pickCardTags(recipe: Recipe, max = 3): string[] {
  const set = new Set(recipe.tags);
  const out: string[] = [];
  for (const t of CARD_TAG_PRIORITY) {
    if (set.has(t)) out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Vollflächige Rezeptkarte für den Entdecken-Stapel (Foto füllt die Karte,
 * Text liegt auf einem weichen Verlauf – wie man es von Dating-Apps kennt).
 */
export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const tags = pickCardTags(recipe);
  return (
    <View style={styles.card}>
      <RecipeImage recipe={recipe} iconSize={96} />
      <LinearGradient
        colors={['rgba(8,30,31,0)', 'rgba(8,30,31,0.55)', 'rgba(8,30,31,0.9)']}
        locations={[0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.body} pointerEvents="none">
        <Row gap={6} style={{ flexWrap: 'wrap', marginBottom: spacing.sm }}>
          {tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text variant="caption" style={styles.tagText}>
                {tagLabel(t)}
              </Text>
            </View>
          ))}
        </Row>
        <Text variant="h1" style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        <Text variant="bodySmall" style={styles.desc} numberOfLines={2}>
          {recipe.shortDescription}
        </Text>
        <Row style={{ marginTop: spacing.md }} gap={spacing.lg}>
          <Row gap={5}>
            <Ionicons name="time-outline" size={16} color={colors.neutral.white} />
            <Text variant="label" style={styles.meta}>
              {recipe.totalTimeMinutes} Min.
            </Text>
          </Row>
          <Row gap={5}>
            <Ionicons name="people-outline" size={16} color={colors.neutral.white} />
            <Text variant="label" style={styles.meta}>
              {recipe.defaultServings} {recipe.defaultServings === 1 ? 'Portion' : 'Portionen'}
            </Text>
          </Row>
        </Row>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.neutral.beige,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.card,
  },
  body: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.xl, paddingBottom: spacing.xl },
  tag: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: colors.neutral.white },
  title: { color: colors.neutral.white, fontSize: 34, lineHeight: 36 },
  desc: { color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  meta: { color: colors.neutral.white },
});
