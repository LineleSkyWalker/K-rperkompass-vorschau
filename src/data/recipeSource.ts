/**
 * Rezeptquelle für die App.
 * - Lokaler Modus (kein Supabase konfiguriert): Seed-Rezepte aus data/recipes
 *   + Nährwerte aus data/bls/ingredient-nutrition.json (falls generiert).
 * - Supabase-Modus: Rezepte aus der Datenbank (recipe + recipe_ingredient + …).
 */
import type { MappingStatus, Recipe } from '@/types/recipe';
import type { NutrientValues } from '@/types/nutrition';
import { RECIPES as SEED_RECIPES } from '../../data/recipes';
import nutritionFile from '../../data/bls/ingredient-nutrition.json';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { mapDbRecipe, type DbRecipeRow } from './supabaseMappers';

interface NutritionFile {
  status: string;
  source: string | null;
  generatedAt: string | null;
  ingredients: Record<string, { blsCode: string; blsName: string; mappingStatus: string; nutritionPer100g: NutrientValues }>;
}

const nutrition = nutritionFile as unknown as NutritionFile;

export const NUTRITION_DATA_AVAILABLE = nutrition.status === 'generated';
export const NUTRITION_SOURCE = nutrition.source;

function attachLocalNutrition(recipe: Recipe): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ri) => {
      const n = nutrition.ingredients[ri.ingredientId];
      if (!n || !ri.ingredient) return ri;
      return {
        ...ri,
        ingredient: {
          ...ri.ingredient,
          blsCode: n.blsCode,
          mappingStatus: n.mappingStatus as MappingStatus,
          nutritionPer100g: n.nutritionPer100g,
        },
      };
    }),
  };
}

export async function loadRecipes(): Promise<{ recipes: Recipe[]; source: 'local' | 'supabase' }> {
  if (isSupabaseConfigured) {
    const sb = getSupabase()!;
    const { data, error } = await sb
      .from('recipe')
      .select(
        `*, recipe_tag(tag_id), recipe_step(*), recipe_ingredient(*, ingredient(*, bls_food(bls_code, nutrients)))`,
      )
      .eq('status', 'published')
      .order('title');
    if (!error && data && data.length > 0) {
      return { recipes: (data as unknown as DbRecipeRow[]).map(mapDbRecipe), source: 'supabase' };
    }
    if (error) console.warn('Supabase-Rezepte konnten nicht geladen werden, nutze lokale Seed-Daten:', error.message);
  }
  return { recipes: SEED_RECIPES.map(attachLocalNutrition), source: 'local' };
}
