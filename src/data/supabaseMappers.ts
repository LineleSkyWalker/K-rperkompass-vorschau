import type { Allergen, Ingredient, MappingStatus, MealType, Recipe, RecipeIngredient, ShoppingCategory, Unit } from '@/types/recipe';
import type { NutrientValues } from '@/types/nutrition';
import { NUTRIENT_CODES } from '@/types/nutrition';

export interface DbIngredientRow {
  id: string;
  slug: string;
  canonical_name: string;
  plural_name: string | null;
  shopping_category: ShoppingCategory;
  grams_per_piece: number | null;
  grams_per_tablespoon: number | null;
  grams_per_teaspoon: number | null;
  density_g_per_ml: number | null;
  allergens: string[];
  nutrition_negligible: boolean;
  bls_code: string | null;
  mapping_status: MappingStatus;
  bls_food: { bls_code: string; nutrients: Record<string, number> } | null;
}

export interface DbRecipeIngredientRow {
  id: string;
  ingredient_id: string;
  quantity: number | null;
  unit: string | null;
  quantity_in_grams: number | null;
  optional: boolean;
  preparation_note: string | null;
  ingredient_group: string | null;
  sort_order: number;
  ingredient: DbIngredientRow | null;
}

export interface DbRecipeRow {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  image_url: string | null;
  image_source_type: Recipe['image'] extends infer I ? (I extends { sourceType: infer S } ? S : never) : never;
  image_source_name: string | null;
  image_license: string | null;
  image_attribution: string | null;
  image_source_url: string | null;
  meal_types: MealType[];
  cuisine: string | null;
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number;
  difficulty: Recipe['difficulty'];
  default_servings: number;
  allergens: string[];
  keeps_days: number | null;
  freezable: boolean;
  source_type: Recipe['sourceType'];
  source_name: string | null;
  source_url: string | null;
  source_license: string | null;
  source_author: string | null;
  imported_at: string | null;
  status: Recipe['status'];
  created_at: string;
  updated_at: string;
  recipe_tag: { tag_id: string }[];
  recipe_step: { id: string; step_number: number; text: string; duration_minutes: number | null }[];
  recipe_ingredient: DbRecipeIngredientRow[];
}

function pickNutrients(all: Record<string, number> | undefined): NutrientValues | undefined {
  if (!all) return undefined;
  const out: NutrientValues = {};
  for (const code of NUTRIENT_CODES) out[code] = all[code] ?? null;
  return out;
}

export function mapDbIngredient(row: DbIngredientRow): Ingredient {
  // Nährwerte nur übernehmen, wenn die Zuordnung mindestens vorgeschlagen ist
  const useNutrition = row.bls_food && (row.mapping_status === 'verified' || row.mapping_status === 'suggested');
  return {
    id: row.id,
    canonicalName: row.canonical_name,
    pluralName: row.plural_name ?? undefined,
    shoppingCategory: row.shopping_category,
    gramsPerPiece: row.grams_per_piece ?? undefined,
    gramsPerTablespoon: row.grams_per_tablespoon ?? undefined,
    gramsPerTeaspoon: row.grams_per_teaspoon ?? undefined,
    densityGPerMl: row.density_g_per_ml ?? undefined,
    blsCode: row.bls_code,
    mappingStatus: row.mapping_status,
    allergens: row.allergens as Allergen[],
    nutritionNegligible: row.nutrition_negligible ?? false,
    nutritionPer100g: useNutrition ? pickNutrients(row.bls_food?.nutrients) : undefined,
  };
}

export function mapDbRecipe(row: DbRecipeRow): Recipe {
  const ingredients: RecipeIngredient[] = [...row.recipe_ingredient]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((ri) => ({
      id: ri.id,
      ingredientId: ri.ingredient_id,
      ingredient: ri.ingredient ? mapDbIngredient(ri.ingredient) : undefined,
      quantity: ri.quantity,
      unit: (ri.unit as Unit | null) ?? null,
      quantityInGrams: ri.quantity_in_grams,
      optional: ri.optional,
      preparationNote: ri.preparation_note ?? undefined,
      group: ri.ingredient_group ?? undefined,
      sortOrder: ri.sort_order,
    }));
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    image: row.image_url
      ? {
          url: row.image_url,
          sourceType: row.image_source_type ?? 'placeholder',
          sourceName: row.image_source_name ?? undefined,
          license: row.image_license ?? undefined,
          attribution: row.image_attribution ?? undefined,
          sourceUrl: row.image_source_url ?? undefined,
        }
      : null,
    mealTypes: row.meal_types,
    cuisine: row.cuisine ?? undefined,
    tags: row.recipe_tag.map((t) => t.tag_id),
    prepTimeMinutes: row.prep_time_minutes,
    cookTimeMinutes: row.cook_time_minutes,
    totalTimeMinutes: row.total_time_minutes,
    difficulty: row.difficulty,
    defaultServings: row.default_servings,
    ingredients,
    steps: [...row.recipe_step]
      .sort((a, b) => a.step_number - b.step_number)
      .map((s) => ({ id: s.id, stepNumber: s.step_number, text: s.text, durationMinutes: s.duration_minutes ?? undefined })),
    allergens: row.allergens as Allergen[],
    keepsDays: row.keeps_days ?? undefined,
    freezable: row.freezable,
    sourceType: row.source_type,
    sourceName: row.source_name ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceLicense: row.source_license ?? undefined,
    sourceAuthor: row.source_author ?? undefined,
    importedAt: row.imported_at ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
