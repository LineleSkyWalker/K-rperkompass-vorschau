import {
  NUTRIENT_CODES,
  type NutrientCode,
  type NutrientTotals,
  type NutrientValues,
  type DataQuality,
} from '@/types/nutrition';
import type { Recipe, MealPlanEntry } from '@/types/recipe';

export interface NutritionInput {
  grams: number | null;
  nutritionPer100g: NutrientValues | undefined;
}

function emptyRecord(): Record<NutrientCode, number> {
  const r = {} as Record<NutrientCode, number>;
  for (const code of NUTRIENT_CODES) r[code] = 0;
  return r;
}

export function emptyTotals(): NutrientTotals {
  return { values: emptyRecord(), missingGrams: emptyRecord(), totalGrams: 0, unmappedIngredients: 0 };
}

/**
 * Summiert Nährwerte über Zutaten. Fehlende Werte (null/undefined) werden
 * NICHT als 0 gezählt, sondern als "fehlende Gramm" protokolliert.
 * Zutaten ohne Grammangabe oder ohne Nährwertdaten werden als unmapped gezählt.
 */
export function sumNutrition(inputs: NutritionInput[]): NutrientTotals {
  const totals = emptyTotals();
  for (const input of inputs) {
    if (input.grams === null || input.grams <= 0) {
      // z. B. "Salz nach Geschmack" – ignorieren, nicht als unmapped werten
      if (input.grams === null && input.nutritionPer100g) continue;
      if (input.grams === null) {
        totals.unmappedIngredients += 1;
        continue;
      }
      continue;
    }
    if (!input.nutritionPer100g) {
      totals.unmappedIngredients += 1;
      continue;
    }
    totals.totalGrams += input.grams;
    const factor = input.grams / 100;
    for (const code of NUTRIENT_CODES) {
      const v = input.nutritionPer100g[code];
      if (v === null || v === undefined || !Number.isFinite(v)) {
        totals.missingGrams[code] += input.grams;
      } else {
        totals.values[code] += v * factor;
      }
    }
  }
  return totals;
}

export function addTotals(a: NutrientTotals, b: NutrientTotals): NutrientTotals {
  const out = emptyTotals();
  for (const code of NUTRIENT_CODES) {
    out.values[code] = a.values[code] + b.values[code];
    out.missingGrams[code] = a.missingGrams[code] + b.missingGrams[code];
  }
  out.totalGrams = a.totalGrams + b.totalGrams;
  out.unmappedIngredients = a.unmappedIngredients + b.unmappedIngredients;
  return out;
}

export function scaleTotals(t: NutrientTotals, factor: number): NutrientTotals {
  const out = emptyTotals();
  for (const code of NUTRIENT_CODES) {
    out.values[code] = t.values[code] * factor;
    out.missingGrams[code] = t.missingGrams[code] * factor;
  }
  out.totalGrams = t.totalGrams * factor;
  out.unmappedIngredients = t.unmappedIngredients;
  return out;
}

/** Nährwerte für das gesamte Rezept bei default_servings. */
export function recipeTotals(recipe: Recipe): NutrientTotals {
  return sumNutrition(
    recipe.ingredients.map((ri) => ({
      grams: ri.quantityInGrams,
      nutritionPer100g: ri.ingredient?.nutritionPer100g,
    })),
  );
}

/** Nährwerte pro Portion. */
export function recipePerServing(recipe: Recipe): NutrientTotals {
  if (recipe.defaultServings <= 0) return emptyTotals();
  return scaleTotals(recipeTotals(recipe), 1 / recipe.defaultServings);
}

/**
 * Nährwerte für einen Wochenplan-Eintrag: nur die tatsächlich GEGESSENEN
 * Portionen zählen (Reste werden an dem Tag gezählt, an dem sie gegessen werden).
 */
export function entryTotals(entry: MealPlanEntry): NutrientTotals {
  if (!entry.recipe) return emptyTotals();
  return scaleTotals(recipePerServing(entry.recipe), entry.servingsEaten);
}

export function dayTotals(entries: MealPlanEntry[]): NutrientTotals {
  return entries.reduce((acc, e) => addTotals(acc, entryTotals(e)), emptyTotals());
}

export function weekTotals(entries: MealPlanEntry[]): { total: NutrientTotals; perDayAverage: NutrientTotals; daysWithEntries: number } {
  const total = dayTotals(entries);
  const days = new Set(entries.map((e) => e.date)).size;
  return {
    total,
    perDayAverage: days > 0 ? scaleTotals(total, 1 / days) : emptyTotals(),
    daysWithEntries: days,
  };
}

/**
 * Omega-6 : Omega-3 – Verhältnis. Gibt null zurück, wenn Omega-3 = 0 oder
 * die Daten unvollständig sind.
 */
export function omegaRatio(totals: NutrientTotals): { ratio: number | null; text: string; complete: boolean } {
  const n3 = totals.values.FAPUN3;
  const n6 = totals.values.FAPUN6;
  const complete = totals.missingGrams.FAPUN3 === 0 && totals.missingGrams.FAPUN6 === 0;
  if (n3 <= 0) return { ratio: null, text: '–', complete };
  const ratio = n6 / n3;
  return { ratio, text: `${formatNumber(ratio, 1)} : 1`, complete };
}

/** Anteil (0..1) der Gesamtmenge, für den ein Nährstoffwert vorlag. */
export function coverage(totals: NutrientTotals, code: NutrientCode): number {
  if (totals.totalGrams <= 0) return 0;
  return 1 - totals.missingGrams[code] / totals.totalGrams;
}

export function dataQuality(totals: NutrientTotals, code: NutrientCode): DataQuality {
  if (totals.totalGrams <= 0) return 'unavailable';
  const c = coverage(totals, code);
  if (totals.unmappedIngredients > 0 || c < 0.999) return 'incomplete';
  return 'bls_calculated';
}

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Sinnvolle Nachkommastellen je Einheit */
export function formatNutrient(value: number, unit: string): string {
  if (unit === 'kcal' || unit === 'kJ') return `${formatNumber(value, 0)} ${unit}`;
  if (unit === 'g') return `${formatNumber(value, value < 10 ? 1 : 0)} g`;
  if (unit === 'mg') return `${formatNumber(value, value < 10 ? 1 : 0)} mg`;
  if (unit === 'µg') return `${formatNumber(value, value < 10 ? 1 : 0)} µg`;
  return `${formatNumber(value, 1)} ${unit}`;
}

export const NUTRITION_DISCLAIMER =
  'Nährwertangaben sind berechnete Näherungswerte auf Basis des Bundeslebensmittelschlüssels (BLS 4.0, Max Rubner-Institut) und können je nach verwendeten Zutaten und Zubereitung variieren.';
