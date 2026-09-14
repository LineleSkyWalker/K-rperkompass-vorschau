import type { Recipe, RecipeIngredient } from '@/types/recipe';
import { formatQuantity } from './units';

/**
 * Skaliert eine Zutat von `fromServings` auf `toServings`.
 * Mengen ohne Zahl (null, "nach Geschmack") bleiben unverändert.
 */
export function scaleIngredient(
  ingredient: RecipeIngredient,
  fromServings: number,
  toServings: number,
): RecipeIngredient {
  if (fromServings <= 0 || toServings <= 0) {
    throw new Error('Portionen müssen größer als 0 sein.');
  }
  const factor = toServings / fromServings;
  const quantity = ingredient.quantity === null ? null : ingredient.quantity * factor;
  const quantityInGrams =
    ingredient.quantityInGrams === null ? null : ingredient.quantityInGrams * factor;
  return {
    ...ingredient,
    quantity,
    quantityInGrams,
    displayText: buildDisplayText({ ...ingredient, quantity }),
  };
}

export function scaleRecipe(recipe: Recipe, toServings: number): Recipe {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((i) =>
      scaleIngredient(i, recipe.defaultServings, toServings),
    ),
  };
}

/** Erzeugt den Anzeigetext, z. B. "400 g Nudeln" oder "Salz" */
export function buildDisplayText(ingredient: RecipeIngredient): string {
  const name =
    ingredient.ingredient?.canonicalName ?? ingredient.displayText ?? 'Zutat';
  const displayName = stripQualifier(name);
  if (ingredient.quantity === null) {
    return ingredient.preparationNote ? `${displayName}, ${ingredient.preparationNote}` : displayName;
  }
  const qty = formatQuantity(ingredient.quantity, ingredient.unit);
  const base = `${qty} ${displayName}`.trim();
  return ingredient.preparationNote ? `${base}, ${ingredient.preparationNote}` : base;
}

/** "Tomate, frisch" → "Tomate" für die Anzeige; die kanonische Form bleibt in der DB. */
function stripQualifier(name: string): string {
  const idx = name.indexOf(',');
  return idx > 0 ? name.slice(0, idx).trim() : name;
}

export const SERVING_OPTIONS = [1, 2, 3, 4, 5, 6, 8] as const;
