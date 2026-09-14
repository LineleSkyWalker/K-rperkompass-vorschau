import {
  coverage,
  dataQuality,
  dayTotals,
  omegaRatio,
  recipePerServing,
  recipeTotals,
  sumNutrition,
  weekTotals,
} from '../nutrition';
import { NUT_OIL, NUT_PASTA, NUT_TOMATO, entry, ingredient, recipe, recipeIngredient } from './fixtures';

const pasta = ingredient({ id: 'pasta', canonicalName: 'Nudeln', nutritionPer100g: NUT_PASTA, blsCode: 'X', mappingStatus: 'verified' });
const tomato = ingredient({ id: 'tomato', canonicalName: 'Tomate', nutritionPer100g: NUT_TOMATO, blsCode: 'Y', mappingStatus: 'verified' });
const oil = ingredient({ id: 'oil', canonicalName: 'Olivenöl', nutritionPer100g: NUT_OIL, blsCode: 'Z', mappingStatus: 'verified' });
const unknown = ingredient({ id: 'unknown', canonicalName: 'Geheimzutat' });

describe('sumNutrition', () => {
  it('summiert pro 100 g korrekt', () => {
    const t = sumNutrition([
      { grams: 200, nutritionPer100g: NUT_PASTA },
      { grams: 50, nutritionPer100g: NUT_TOMATO },
    ]);
    expect(t.values.ENERCC).toBeCloseTo(700 + 9);
    expect(t.values.PROT625).toBeCloseTo(24 + 0.5);
    expect(t.totalGrams).toBe(250);
    expect(t.unmappedIngredients).toBe(0);
  });

  it('zählt fehlende BLS-Werte NICHT als 0, sondern als fehlende Gramm', () => {
    const t = sumNutrition([{ grams: 100, nutritionPer100g: NUT_TOMATO }]);
    // FAPUN3 ist bei Tomate null → fehlt für 100 g
    expect(t.values.FAPUN3).toBe(0);
    expect(t.missingGrams.FAPUN3).toBe(100);
    expect(coverage(t, 'FAPUN3')).toBe(0);
    expect(dataQuality(t, 'FAPUN3')).toBe('incomplete');
    // VITC ist vorhanden → vollständig
    expect(t.missingGrams.VITC).toBe(0);
    expect(dataQuality(t, 'VITC')).toBe('bls_calculated');
  });

  it('zählt Zutaten ohne Nährwertdaten als unmapped', () => {
    const t = sumNutrition([
      { grams: 100, nutritionPer100g: NUT_PASTA },
      { grams: 30, nutritionPer100g: undefined },
    ]);
    expect(t.unmappedIngredients).toBe(1);
    expect(dataQuality(t, 'ENERCC')).toBe('incomplete');
  });

  it('ignoriert Zutaten "nach Geschmack" mit Daten, ohne sie als unmapped zu werten', () => {
    const t = sumNutrition([{ grams: null, nutritionPer100g: NUT_PASTA }]);
    expect(t.unmappedIngredients).toBe(0);
    expect(t.totalGrams).toBe(0);
  });
});

describe('recipeTotals / recipePerServing', () => {
  const r = recipe({
    id: 'r',
    defaultServings: 2,
    ingredients: [
      recipeIngredient(pasta, 200, 'g', 200),
      recipeIngredient(tomato, 300, 'g', 300),
      recipeIngredient(oil, 2, 'EL', 20),
    ],
  });

  it('berechnet Gesamt und pro Portion', () => {
    const total = recipeTotals(r);
    expect(total.values.ENERCC).toBeCloseTo(700 + 54 + 176);
    const per = recipePerServing(r);
    expect(per.values.ENERCC).toBeCloseTo((700 + 54 + 176) / 2);
    expect(per.totalGrams).toBe(260);
  });

  it('berechnet das Omega-6:3-Verhältnis und markiert Unvollständigkeit', () => {
    const total = recipeTotals(r);
    // n3: pasta 0.1 + oil 0.16 = 0.26 ; n6: pasta 1.6 + tomato 0.3 + oil 1.8 = 3.7
    const ratio = omegaRatio(total);
    expect(ratio.ratio).toBeCloseTo(3.7 / 0.26, 2);
    expect(ratio.text).toBe('14,2 : 1');
    expect(ratio.complete).toBe(false); // Tomate hat kein FAPUN3
  });

  it('gibt null-Ratio bei Omega-3 = 0', () => {
    const t = sumNutrition([{ grams: 100, nutritionPer100g: { FAPUN3: 0, FAPUN6: 5 } }]);
    expect(omegaRatio(t).ratio).toBeNull();
  });

  it('meldet unmapped Zutaten', () => {
    const r2 = recipe({ id: 'r2', ingredients: [recipeIngredient(unknown, 100, 'g', 100)] });
    expect(recipeTotals(r2).unmappedIngredients).toBe(1);
  });
});

describe('Wochenplan-Auswertung', () => {
  const r = recipe({
    id: 'curry',
    defaultServings: 4,
    ingredients: [recipeIngredient(pasta, 400, 'g', 400)], // 1400 kcal gesamt, 350/Portion
  });

  it('zählt nur gegessene Portionen (Meal Prep / Reste)', () => {
    const monday = entry({ recipe: r, date: '2026-09-14', servings: 4, servingsEaten: 2 });
    const tuesday = entry({ recipe: r, date: '2026-09-15', servings: 2, servingsEaten: 2, leftoverOfEntryId: monday.id });
    expect(dayTotals([monday]).values.ENERCC).toBeCloseTo(700);
    expect(dayTotals([tuesday]).values.ENERCC).toBeCloseTo(700);
  });

  it('bildet Wochensumme und Tagesdurchschnitt über Tage mit Einträgen', () => {
    const e1 = entry({ recipe: r, date: '2026-09-14', servingsEaten: 1 });
    const e2 = entry({ recipe: r, date: '2026-09-14', servingsEaten: 1 });
    const e3 = entry({ recipe: r, date: '2026-09-16', servingsEaten: 2 });
    const w = weekTotals([e1, e2, e3]);
    expect(w.total.values.ENERCC).toBeCloseTo(1400);
    expect(w.daysWithEntries).toBe(2);
    expect(w.perDayAverage.values.ENERCC).toBeCloseTo(700);
  });
});
