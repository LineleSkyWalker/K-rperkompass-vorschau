import React, { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Recipe } from '@/types/recipe';
import { colors } from '@/design-system/tokens';

/**
 * Rezeptbild mit Platzhalter. Solange keine lizenzierten/eigenen Bilder
 * hinterlegt sind, zeigt die App eine ruhige, markenkonforme Fläche mit Icon
 * – nie ein leeres Weiß, nie ein fremdes Bild.
 */
const PLACEHOLDER_TONES = [colors.brand.turquoiseSoft, colors.neutral.beige, '#E8F1EC', '#F3E9E0', '#E6EEF2'];

function iconFor(recipe: Recipe): keyof typeof Ionicons.glyphMap {
  if (recipe.tags.includes('soup')) return 'water-outline';
  if (recipe.tags.includes('pasta')) return 'restaurant-outline';
  if (recipe.tags.includes('baking') || recipe.mealTypes.includes('dessert')) return 'ice-cream-outline';
  if (recipe.tags.includes('salad') || recipe.tags.includes('bowl')) return 'leaf-outline';
  if (recipe.mealTypes.includes('breakfast')) return 'sunny-outline';
  if (recipe.tags.includes('fish')) return 'fish-outline';
  if (recipe.tags.includes('pizza') || recipe.tags.includes('burger')) return 'pizza-outline';
  return 'nutrition-outline';
}

export function RecipeImage({
  recipe,
  style,
  iconSize = 56,
}: {
  recipe: Recipe;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
}) {
  const [failed, setFailed] = useState(false);
  const url = recipe.image?.url;
  const tone = PLACEHOLDER_TONES[hash(recipe.id) % PLACEHOLDER_TONES.length];

  if (url && !failed) {
    return (
      <Image
        source={{ uri: url }}
        style={[styles.image, style as object]}
        contentFit="cover"
        transition={200}
        onError={() => setFailed(true)}
        accessibilityLabel={recipe.title}
      />
    );
  }
  return (
    <View style={[styles.image, styles.placeholder, { backgroundColor: tone }, style]} accessibilityLabel={`${recipe.title} (Platzhalterbild)`}>
      <Ionicons name={iconFor(recipe)} size={iconSize} color={colors.brand.petrol} style={{ opacity: 0.55 }} />
    </View>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
