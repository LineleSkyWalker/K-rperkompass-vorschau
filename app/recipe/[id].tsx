import React, { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Divider, EmptyState, IconButton, Notice, Row, Screen, SectionTitle, Tag, Text } from '@/design-system/components';
import { colors, radius, semantic, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { RecipeImage } from '@/components/RecipeImage';
import { NutritionPanel } from '@/components/NutritionPanel';
import { scaleRecipe, SERVING_OPTIONS } from '@/domain/servings';
import { recipeTotals, scaleTotals } from '@/domain/nutrition';
import { tagLabel } from '@/data/tags';
import { ALLERGEN_LABELS } from '@/types/recipe';

const DIFFICULTY: Record<string, string> = { easy: 'einfach', medium: 'mittel', advanced: 'anspruchsvoll' };

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipeById, data, toggleFavorite, markCooked } = useApp();
  const recipe = id ? recipeById.get(id) : undefined;
  const [servings, setServings] = useState<number>(recipe?.defaultServings ?? data.profile.defaultServings);

  const scaled = useMemo(() => (recipe ? scaleRecipe(recipe, servings) : undefined), [recipe, servings]);
  const perServing = useMemo(() => (recipe ? scaleTotals(recipeTotals(recipe), 1 / recipe.defaultServings) : undefined), [recipe]);

  if (!recipe || !scaled || !perServing) {
    return (
      <Screen style={{ paddingTop: insets.top }}>
        <EmptyState icon="search-outline" title="Rezept nicht gefunden" action={<Button label="Zurück" onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const isFavorite = data.favorites.includes(recipe.id);
  const groups = groupIngredients(scaled.ingredients);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          <RecipeImage recipe={recipe} iconSize={80} />
          <View style={[styles.heroBar, { top: insets.top + spacing.sm }]}>
            <IconButton icon="chevron-back" accessibilityLabel="Zurück" onPress={() => router.back()} />
            <IconButton
              icon={isFavorite ? 'heart' : 'heart-outline'}
              accessibilityLabel={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten'}
              color={isFavorite ? semantic.textOnAccent : semantic.accentStrong}
              background={isFavorite ? colors.brand.turquoise : semantic.surface}
              onPress={() => toggleFavorite(recipe.id)}
            />
          </View>
        </View>

        <View style={styles.content}>
          {recipe.image?.url && recipe.image.attribution ? (
            <Text
              variant="caption"
              tone="muted"
              style={{ marginBottom: spacing.sm }}
              onPress={recipe.image.sourceUrl ? () => Linking.openURL(recipe.image!.sourceUrl!) : undefined}
              accessibilityRole={recipe.image.sourceUrl ? 'link' : undefined}
            >
              {recipe.image.attribution}
            </Text>
          ) : null}
          <Text variant="h1">{recipe.title}</Text>
          <Text variant="body" tone="secondary" style={{ marginTop: spacing.xs }}>
            {recipe.shortDescription}
          </Text>

          <Row style={{ marginTop: spacing.md, flexWrap: 'wrap' }} gap={spacing.lg}>
            <Meta icon="time-outline" text={`${recipe.totalTimeMinutes} Min.`} sub={`${recipe.prepTimeMinutes} vorb. · ${recipe.cookTimeMinutes} kochen`} />
            <Meta icon="speedometer-outline" text={DIFFICULTY[recipe.difficulty] ?? recipe.difficulty} />
            {recipe.keepsDays ? <Meta icon="snow-outline" text={`hält ${recipe.keepsDays} Tage`} sub={recipe.freezable ? 'einfrierbar' : undefined} /> : null}
          </Row>

          <Row style={{ marginTop: spacing.md, flexWrap: 'wrap' }} gap={6}>
            {recipe.tags
              .filter((t) => !['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].includes(t))
              .map((t) => (
                <Tag key={t} label={tagLabel(t)} />
              ))}
          </Row>

          {recipe.allergens.length ? (
            <Notice
              style={{ marginTop: spacing.md }}
              text={`Enthält: ${recipe.allergens.map((a) => ALLERGEN_LABELS[a]).join(', ')}`}
            />
          ) : null}

          <Divider />

          <Row style={{ justifyContent: 'space-between' }}>
            <SectionTitle style={{ marginBottom: 0 }}>Zutaten</SectionTitle>
            <Text variant="label" tone="secondary">
              für {servings} {servings === 1 ? 'Portion' : 'Portionen'}
            </Text>
          </Row>
          <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }} gap={6}>
            {SERVING_OPTIONS.map((n) => (
              <Chip key={n} label={String(n)} small selected={n === servings} onPress={() => setServings(n)} />
            ))}
          </Row>

          {groups.map((g) => (
            <View key={g.name ?? '_'} style={{ marginTop: spacing.md }}>
              {g.name ? (
                <Text variant="label" tone="secondary" style={{ marginBottom: 4 }}>
                  {g.name}
                </Text>
              ) : null}
              {g.items.map((ri) => (
                <Row key={ri.id} style={styles.ingredientLine} gap={spacing.sm}>
                  <View style={styles.bullet} />
                  <Text variant="body" style={{ flex: 1 }}>
                    {ri.displayText}
                    {ri.optional ? <Text variant="bodySmall" tone="muted"> (optional)</Text> : null}
                  </Text>
                </Row>
              ))}
            </View>
          ))}

          <Divider />
          <SectionTitle>Zubereitung</SectionTitle>
          {recipe.steps.map((s) => (
            <Row key={s.id} style={styles.step} gap={spacing.md}>
              <View style={styles.stepNumber}>
                <Text variant="label" tone="onAccent">
                  {s.stepNumber}
                </Text>
              </View>
              <Text variant="body" style={{ flex: 1 }}>
                {s.text}
              </Text>
            </Row>
          ))}

          {data.profile.showNutrition ? (
            <>
              <Divider />
              <NutritionPanel totals={perServing} showReferenceValues={data.profile.showReferenceValues} />
            </>
          ) : null}

          <Divider />
          <Text variant="caption" tone="muted">
            Quelle: {recipe.sourceName ?? 'KÖRPER.KOMPASS'}
            {recipe.image?.sourceType === 'placeholder' ? ' · Bild: Platzhalter' : recipe.image?.attribution ? ` · Bild: ${recipe.image.attribution}` : ''}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Gekocht" variant="secondary" icon="checkmark" onPress={() => markCooked(recipe.id)} style={{ flex: 1 }} />
        <Button
          label="Zum Wochenplan"
          icon="calendar-outline"
          onPress={() => router.push({ pathname: '/add-to-plan', params: { recipeId: recipe.id, servings: String(servings) } })}
          style={{ flex: 2 }}
        />
      </View>
    </Screen>
  );
}

function Meta({ icon, text, sub }: { icon: keyof typeof Ionicons.glyphMap; text: string; sub?: string }) {
  return (
    <Row gap={6}>
      <Ionicons name={icon} size={18} color={semantic.accentStrong} />
      <View>
        <Text variant="label">{text}</Text>
        {sub ? (
          <Text variant="caption" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
    </Row>
  );
}

function groupIngredients<T extends { group?: string }>(items: T[]): { name: string | null; items: T[] }[] {
  const out: { name: string | null; items: T[] }[] = [];
  for (const it of items) {
    const name = it.group ?? null;
    let g = out.find((x) => x.name === name);
    if (!g) {
      g = { name, items: [] };
      out.push(g);
    }
    g.items.push(it);
  }
  return out;
}

const styles = StyleSheet.create({
  hero: { height: 320, backgroundColor: semantic.surfaceMuted },
  heroBar: { position: 'absolute', left: spacing.lg, right: spacing.lg, flexDirection: 'row', justifyContent: 'space-between' },
  content: {
    marginTop: -radius.xl,
    backgroundColor: semantic.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
  },
  ingredientLine: { paddingVertical: 6, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.turquoise, marginTop: 9 },
  step: { alignItems: 'flex-start', marginBottom: spacing.md },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: semantic.accentStrong, alignItems: 'center', justifyContent: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: semantic.background,
    borderTopWidth: 1,
    borderTopColor: semantic.border,
  },
});
