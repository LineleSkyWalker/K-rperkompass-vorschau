/**
 * Kleine Autoren-DSL für KÖRPER.KOMPASS-Rezepte.
 * Rezepte werden kompakt geschrieben und hier in das vollständige
 * Recipe-Datenmodell überführt (Gramm-Umrechnung, Allergene, Zeiten).
 */
import type { Allergen, Difficulty, MealType, Recipe, RecipeIngredient, Unit } from '../../src/types/recipe';
import { toGrams } from '../../src/domain/units';
import { INGREDIENT_BY_ID, type CatalogIngredient } from '../ingredients';

/** [zutatId, menge, einheit, zubereitungsnotiz?, optionen?] */
export type IngredientLine =
  | [id: string, quantity: number | null, unit: Unit | null]
  | [id: string, quantity: number | null, unit: Unit | null, note: string]
  | [id: string, quantity: number | null, unit: Unit | null, note: string | undefined, opts: { optional?: boolean; group?: string; grams?: number }];

export interface RecipeDraft {
  slug: string;
  title: string;
  short: string;
  mealTypes: MealType[];
  tags: string[];
  cuisine?: string;
  prep: number;
  cook: number;
  difficulty?: Difficulty;
  servings: number;
  keepsDays?: number;
  freezable?: boolean;
  ingredients: IngredientLine[];
  steps: string[];
  /** Zusätzliche Allergene, die nicht aus den Zutaten hervorgehen */
  extraAllergens?: Allergen[];
}

const NOW = '2026-09-14T00:00:00Z';

export function toIngredientModel(c: CatalogIngredient) {
  return {
    id: c.id,
    canonicalName: c.name,
    pluralName: c.plural,
    shoppingCategory: c.category,
    gramsPerPiece: c.gramsPerPiece,
    gramsPerTablespoon: c.gramsPerTablespoon,
    gramsPerTeaspoon: c.gramsPerTeaspoon,
    densityGPerMl: c.densityGPerMl,
    blsCode: null,
    mappingStatus: 'unmapped' as const,
    allergens: c.allergens ?? [],
    nutritionNegligible: c.nutritionNegligible,
  };
}

export function buildRecipe(d: RecipeDraft): Recipe {
  const allergens = new Set<Allergen>(d.extraAllergens ?? []);
  const ingredients: RecipeIngredient[] = d.ingredients.map((line, idx) => {
    const [id, quantity, unit, note, opts] = line as [string, number | null, Unit | null, string?, { optional?: boolean; group?: string; grams?: number }?];
    const cat = INGREDIENT_BY_ID[id];
    if (!cat) throw new Error(`Rezept "${d.slug}": unbekannte Zutat "${id}"`);
    if (!opts?.optional) for (const a of cat.allergens ?? []) allergens.add(a);
    const grams = opts?.grams ?? toGrams(quantity, unit, cat);
    return {
      id: `${d.slug}__${id}__${idx}`,
      ingredientId: id,
      ingredient: toIngredientModel(cat),
      quantity,
      unit,
      quantityInGrams: grams,
      optional: opts?.optional ?? false,
      preparationNote: note,
      group: opts?.group,
      sortOrder: idx,
    };
  });

  const total = d.prep + d.cook;
  const tags = new Set(d.tags);
  if (total <= 15) tags.add('under_15_min');
  if (total <= 30) tags.add('under_30_min');
  for (const m of d.mealTypes) tags.add(m);

  return {
    id: d.slug,
    slug: d.slug,
    title: d.title,
    shortDescription: d.short,
    image: { url: '', sourceType: 'placeholder', sourceName: 'Platzhalter – Bild folgt' },
    mealTypes: d.mealTypes,
    cuisine: d.cuisine,
    tags: [...tags],
    prepTimeMinutes: d.prep,
    cookTimeMinutes: d.cook,
    totalTimeMinutes: total,
    difficulty: d.difficulty ?? 'easy',
    defaultServings: d.servings,
    ingredients,
    steps: d.steps.map((text, i) => ({ id: `${d.slug}__step${i + 1}`, stepNumber: i + 1, text })),
    allergens: [...allergens],
    keepsDays: d.keepsDays,
    freezable: d.freezable ?? false,
    sourceType: 'koerperkompass',
    sourceName: 'KÖRPER.KOMPASS',
    status: 'published',
    createdAt: NOW,
    updatedAt: NOW,
  };
}
