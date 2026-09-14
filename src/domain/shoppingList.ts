import type {
  Ingredient,
  MealPlanEntry,
  ShoppingCategory,
  ShoppingListItem,
  Unit,
} from '@/types/recipe';
import { SHOPPING_CATEGORY_ORDER } from '@/types/recipe';
import { formatQuantity, isMassUnit, isVolumeUnit, toGrams } from './units';

export interface AggregatedItem {
  key: string;
  ingredientId: string | null;
  name: string;
  category: ShoppingCategory;
  /** Menge in Gramm, wenn alle Vorkommen in Gramm umrechenbar waren */
  quantityInGrams: number | null;
  /** Fallback: Menge in Originaleinheit (nur wenn alle Vorkommen dieselbe Einheit hatten) */
  quantity: number | null;
  unit: Unit | null;
  fromRecipeIds: string[];
  /** Zutaten „nach Geschmack“ (z. B. Salz) */
  toTaste: boolean;
}

interface Occurrence {
  ingredient: Ingredient;
  quantity: number | null;
  unit: Unit | null;
  quantityInGrams: number | null;
  recipeId: string;
}

/**
 * Wählt die beste Anzeige-Einheit: Stückzahlen bleiben Stück (wenn alle Vorkommen
 * Stück sind), sonst Gramm/Milliliter. Bei Mischung (z. B. 2 Stück + 100 g) → Gramm,
 * falls gramsPerPiece bekannt, sonst getrennte Angabe.
 */
function aggregateOccurrences(list: Occurrence[]): Pick<AggregatedItem, 'quantity' | 'unit' | 'quantityInGrams' | 'toTaste'> {
  const withQty = list.filter((o) => o.quantity !== null);
  if (withQty.length === 0) return { quantity: null, unit: null, quantityInGrams: null, toTaste: true };

  const units = new Set(withQty.map((o) => o.unit));
  const first = withQty[0]!;
  const allGrams = withQty.every((o) => o.quantityInGrams !== null);
  const totalGrams = allGrams ? withQty.reduce((s, o) => s + (o.quantityInGrams ?? 0), 0) : null;

  // Alle Masse (g/kg) → Gramm
  if (withQty.every((o) => isMassUnit(o.unit))) {
    const g = withQty.reduce((s, o) => s + (o.quantity ?? 0) * (o.unit === 'kg' ? 1000 : 1), 0);
    return { quantity: g, unit: 'g', quantityInGrams: totalGrams ?? g, toTaste: false };
  }
  // Alle Volumen (ml/l) → Milliliter
  if (withQty.every((o) => isVolumeUnit(o.unit))) {
    const ml = withQty.reduce((s, o) => s + (o.quantity ?? 0) * (o.unit === 'l' ? 1000 : 1), 0);
    return { quantity: ml, unit: 'ml', quantityInGrams: totalGrams, toTaste: false };
  }
  // Alle gleiche sonstige Einheit (Stück, EL, ...) → in dieser Einheit summieren
  if (units.size === 1) {
    const sum = withQty.reduce((s, o) => s + (o.quantity ?? 0), 0);
    return { quantity: sum, unit: first.unit, quantityInGrams: totalGrams, toTaste: false };
  }

  // Gemischt: Masse + Volumen oder Stück + Masse → auf Gramm, wenn möglich
  if (totalGrams !== null) return { quantity: totalGrams, unit: 'g', quantityInGrams: totalGrams, toTaste: false };

  // Nicht zusammenführbar: größte Einheit anzeigen, Rest ignorieren wir nicht – wir summieren in der ersten Einheit,
  // was ungenau wäre. Deshalb: null Menge + Hinweis über unit=null.
  return { quantity: null, unit: null, quantityInGrams: null, toTaste: false };
}

/**
 * Baut aus Wochenplan-Einträgen die zusammengeführte Einkaufsliste.
 * Gleiche Zutaten (gleiche ingredientId) werden addiert; Portionen werden
 * anhand `entry.servings` skaliert; Reste-Einträge (leftoverOfEntryId) werden
 * übersprungen, weil dafür nicht eingekauft werden muss.
 */
export function buildShoppingList(entries: MealPlanEntry[]): AggregatedItem[] {
  const map = new Map<string, Occurrence[]>();

  for (const entry of entries) {
    if (!entry.recipe || entry.leftoverOfEntryId) continue;
    const recipe = entry.recipe;
    const factor = entry.servings / recipe.defaultServings;
    for (const ri of recipe.ingredients) {
      if (!ri.ingredient) continue;
      if (ri.optional) continue;
      const quantity = ri.quantity === null ? null : ri.quantity * factor;
      const quantityInGrams =
        ri.quantityInGrams !== null
          ? ri.quantityInGrams * factor
          : toGrams(quantity, ri.unit, ri.ingredient);
      const key = ri.ingredientId;
      const arr = map.get(key) ?? [];
      arr.push({ ingredient: ri.ingredient, quantity, unit: ri.unit, quantityInGrams, recipeId: recipe.id });
      map.set(key, arr);
    }
  }

  const items: AggregatedItem[] = [];
  for (const [ingredientId, occ] of map) {
    const ingredient = occ[0]!.ingredient;
    const agg = aggregateOccurrences(occ);
    items.push({
      key: ingredientId,
      ingredientId,
      name: ingredient.canonicalName,
      category: ingredient.shoppingCategory,
      fromRecipeIds: [...new Set(occ.map((o) => o.recipeId))],
      ...agg,
    });
  }
  return sortItems(items);
}

export function sortItems<T extends { category: ShoppingCategory; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ca = SHOPPING_CATEGORY_ORDER.indexOf(a.category);
    const cb = SHOPPING_CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name, 'de');
  });
}

export function groupByCategory<T extends { category: ShoppingCategory }>(items: T[]): { category: ShoppingCategory; items: T[] }[] {
  const groups = new Map<ShoppingCategory, T[]>();
  for (const item of items) {
    const arr = groups.get(item.category) ?? [];
    arr.push(item);
    groups.set(item.category, arr);
  }
  return SHOPPING_CATEGORY_ORDER.filter((c) => groups.has(c)).map((c) => ({ category: c, items: groups.get(c)! }));
}

export function formatItemQuantity(item: Pick<AggregatedItem, 'quantity' | 'unit' | 'toTaste'>): string {
  if (item.toTaste) return 'nach Bedarf';
  if (item.quantity === null) return 'Menge prüfen';
  return formatQuantity(item.quantity, item.unit);
}

/**
 * Führt die generierte Liste mit dem gespeicherten Nutzerzustand zusammen
 * (abgehakt / „habe ich bereits“ / manuelle Einträge bleiben erhalten).
 */
export function mergeWithSavedState(
  generated: AggregatedItem[],
  saved: ShoppingListItem[],
  userId: string,
  makeId: (key: string) => string = (key) => `gen_${key}`,
): ShoppingListItem[] {
  const savedByIngredient = new Map(saved.filter((s) => s.ingredientId).map((s) => [s.ingredientId!, s]));
  const fromPlan: ShoppingListItem[] = generated.map((g) => {
    const prev = g.ingredientId ? savedByIngredient.get(g.ingredientId) : undefined;
    return {
      id: prev?.id ?? makeId(g.key),
      userId,
      ingredientId: g.ingredientId,
      name: g.name,
      quantity: g.quantity,
      unit: g.unit,
      quantityInGrams: g.quantityInGrams,
      category: g.category,
      checked: prev?.checked ?? false,
      alreadyHave: prev?.alreadyHave ?? false,
      fromRecipeIds: g.fromRecipeIds,
      manual: false,
    };
  });
  const manual = saved.filter((s) => s.manual);
  return sortItems([...fromPlan, ...manual]);
}
