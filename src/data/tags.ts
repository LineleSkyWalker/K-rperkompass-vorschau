import type { Tag } from '@/types/recipe';

/**
 * Tag-Katalog. Neutrale, nicht-moralisierende Eigenschaften.
 * Wird als Seed in die Tabelle `tag` geschrieben und ist im Admin editierbar.
 */
export const TAGS: Tag[] = [
  // Meal Type (zusätzlich zu recipe.meal_types – für Filterchips)
  { id: 'breakfast', label: 'Frühstück', category: 'meal_type', sortOrder: 1, active: true },
  { id: 'lunch', label: 'Mittagessen', category: 'meal_type', sortOrder: 2, active: true },
  { id: 'dinner', label: 'Abendessen', category: 'meal_type', sortOrder: 3, active: true },
  { id: 'snack', label: 'Snack', category: 'meal_type', sortOrder: 4, active: true },
  { id: 'dessert', label: 'Dessert', category: 'meal_type', sortOrder: 5, active: true },
  // Time
  { id: 'under_15_min', label: 'unter 15 Min.', category: 'time', sortOrder: 1, active: true },
  { id: 'under_30_min', label: 'unter 30 Min.', category: 'time', sortOrder: 2, active: true },
  // Diet
  { id: 'vegetarian', label: 'vegetarisch', category: 'diet', sortOrder: 1, active: true },
  { id: 'vegan', label: 'vegan', category: 'diet', sortOrder: 2, active: true },
  { id: 'gluten_free', label: 'glutenfrei', category: 'diet', sortOrder: 3, active: true },
  { id: 'lactose_free', label: 'laktosefrei', category: 'diet', sortOrder: 4, active: true },
  // Experience
  { id: 'comfort_food', label: 'Comfort Food', category: 'experience', sortOrder: 1, active: true },
  { id: 'fresh', label: 'frisch', category: 'experience', sortOrder: 2, active: true },
  { id: 'crispy', label: 'knusprig', category: 'experience', sortOrder: 3, active: true },
  { id: 'creamy', label: 'cremig', category: 'experience', sortOrder: 4, active: true },
  { id: 'warm', label: 'warm', category: 'experience', sortOrder: 5, active: true },
  { id: 'cold', label: 'kalt', category: 'experience', sortOrder: 6, active: true },
  { id: 'sweet', label: 'süß', category: 'experience', sortOrder: 7, active: true },
  { id: 'savory', label: 'herzhaft', category: 'experience', sortOrder: 8, active: true },
  { id: 'light', label: 'leicht', category: 'experience', sortOrder: 9, active: true },
  { id: 'filling', label: 'sättigend', category: 'experience', sortOrder: 10, active: true },
  { id: 'special', label: 'etwas Besonderes', category: 'experience', sortOrder: 11, active: true },
  { id: 'spicy', label: 'würzig', category: 'experience', sortOrder: 12, active: true },
  // Practical
  { id: 'meal_prep', label: 'Meal Prep', category: 'practical', sortOrder: 1, active: true },
  { id: 'family_friendly', label: 'familienfreundlich', category: 'practical', sortOrder: 2, active: true },
  { id: 'budget', label: 'günstig', category: 'practical', sortOrder: 3, active: true },
  { id: 'few_ingredients', label: 'wenige Zutaten', category: 'practical', sortOrder: 4, active: true },
  { id: 'one_pot', label: 'One Pot', category: 'practical', sortOrder: 5, active: true },
  { id: 'to_go', label: 'zum Mitnehmen', category: 'practical', sortOrder: 6, active: true },
  // Nutrition (neutral formuliert)
  { id: 'protein_rich', label: 'proteinreich', category: 'nutrition', sortOrder: 1, active: true },
  { id: 'fiber_rich', label: 'ballaststoffreich', category: 'nutrition', sortOrder: 2, active: true },
  { id: 'nutrient_dense', label: 'nährstoffreich', category: 'nutrition', sortOrder: 3, active: true },
  { id: 'omega3_source', label: 'Omega-3-Quelle', category: 'nutrition', sortOrder: 4, active: true },
  // Dish type
  { id: 'pasta', label: 'Pasta', category: 'dish_type', sortOrder: 1, active: true },
  { id: 'bowl', label: 'Bowl', category: 'dish_type', sortOrder: 2, active: true },
  { id: 'salad', label: 'Salat', category: 'dish_type', sortOrder: 3, active: true },
  { id: 'soup', label: 'Suppe', category: 'dish_type', sortOrder: 4, active: true },
  { id: 'curry', label: 'Curry', category: 'dish_type', sortOrder: 5, active: true },
  { id: 'casserole', label: 'Auflauf', category: 'dish_type', sortOrder: 6, active: true },
  { id: 'bread_dish', label: 'Brotgericht', category: 'dish_type', sortOrder: 7, active: true },
  { id: 'pizza', label: 'Pizza', category: 'dish_type', sortOrder: 8, active: true },
  { id: 'wrap', label: 'Wrap', category: 'dish_type', sortOrder: 9, active: true },
  { id: 'pancake', label: 'Pfannkuchen', category: 'dish_type', sortOrder: 10, active: true },
  { id: 'baking', label: 'Backen', category: 'dish_type', sortOrder: 11, active: true },
  { id: 'porridge', label: 'Porridge & Müsli', category: 'dish_type', sortOrder: 12, active: true },
  { id: 'burger', label: 'Burger', category: 'dish_type', sortOrder: 13, active: true },
  { id: 'rice_dish', label: 'Reisgericht', category: 'dish_type', sortOrder: 14, active: true },
  { id: 'potato_dish', label: 'Kartoffelgericht', category: 'dish_type', sortOrder: 15, active: true },
  { id: 'egg_dish', label: 'Eiergericht', category: 'dish_type', sortOrder: 16, active: true },
  { id: 'fish', label: 'Fisch', category: 'dish_type', sortOrder: 17, active: true },
];

export const TAG_BY_ID: Record<string, Tag> = Object.fromEntries(TAGS.map((t) => [t.id, t]));

export function tagLabel(id: string): string {
  return TAG_BY_ID[id]?.label ?? id;
}

/** Filter-Chips im Entdecken-Screen (Reihenfolge = Anzeige) */
export const DISCOVER_FILTER_TAGS = [
  'under_15_min',
  'under_30_min',
  'budget',
  'family_friendly',
  'meal_prep',
  'vegetarian',
  'vegan',
  'protein_rich',
  'fiber_rich',
  'sweet',
  'savory',
  'warm',
  'cold',
  'comfort_food',
];
