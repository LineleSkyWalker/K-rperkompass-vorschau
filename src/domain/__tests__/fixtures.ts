import type { Ingredient, MealPlanEntry, Recipe, RecipeIngredient } from '@/types/recipe';
import type { NutrientValues } from '@/types/nutrition';

export function ingredient(partial: Partial<Ingredient> & { id: string; canonicalName: string }): Ingredient {
  return {
    shoppingCategory: 'produce',
    blsCode: null,
    mappingStatus: 'unmapped',
    allergens: [],
    ...partial,
  };
}

export function recipeIngredient(
  ing: Ingredient,
  quantity: number | null,
  unit: RecipeIngredient['unit'],
  quantityInGrams: number | null,
  extra: Partial<RecipeIngredient> = {},
): RecipeIngredient {
  return {
    id: `ri_${ing.id}_${Math.random().toString(36).slice(2, 6)}`,
    ingredientId: ing.id,
    ingredient: ing,
    quantity,
    unit,
    quantityInGrams,
    optional: false,
    sortOrder: 0,
    ...extra,
  };
}

export function recipe(partial: Partial<Recipe> & { id: string }): Recipe {
  return {
    slug: partial.id,
    title: partial.id,
    shortDescription: '',
    image: null,
    mealTypes: ['dinner'],
    tags: [],
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    totalTimeMinutes: 20,
    difficulty: 'easy',
    defaultServings: 2,
    ingredients: [],
    steps: [],
    allergens: [],
    sourceType: 'koerperkompass',
    status: 'published',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

export function entry(partial: Partial<MealPlanEntry> & { recipe: Recipe; date: string }): MealPlanEntry {
  return {
    id: `e_${Math.random().toString(36).slice(2, 8)}`,
    userId: 'u1',
    mealSlot: 'dinner',
    recipeId: partial.recipe.id,
    servings: partial.recipe.defaultServings,
    servingsEaten: partial.servings ?? partial.recipe.defaultServings,
    createdAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

/** Beispiel-Nährwerte (nur für Tests – KEINE echten BLS-Daten) */
export const NUT_PASTA: NutrientValues = { ENERCC: 350, PROT625: 12, CHO: 70, FAT: 2, FIBT: 3, FAPUN3: 0.05, FAPUN6: 0.8 };
export const NUT_TOMATO: NutrientValues = { ENERCC: 18, PROT625: 1, CHO: 3, FAT: 0.2, FIBT: 1, VITC: 20, FAPUN3: null, FAPUN6: 0.1 };
export const NUT_OIL: NutrientValues = { ENERCC: 880, PROT625: 0, CHO: 0, FAT: 100, FIBT: 0, FAPUN3: 0.8, FAPUN6: 9 };
