/** Kontrollbericht: Nährwerte pro Portion für alle Rezepte (lokaler Modus). */
import { RECIPES } from '../data/recipes';
import nutritionFile from '../data/bls/ingredient-nutrition.json';
import { recipePerServing, omegaRatio, dataQuality } from '../src/domain/nutrition';
import type { NutrientValues } from '../src/types/nutrition';
import type { MappingStatus } from '../src/types/recipe';

const nut = nutritionFile as unknown as { ingredients: Record<string, { blsCode: string; mappingStatus: MappingStatus; nutritionPer100g: NutrientValues }> };

let incomplete = 0;
for (const r of RECIPES) {
  const withN = { ...r, ingredients: r.ingredients.map((ri) => { const n = nut.ingredients[ri.ingredientId]; return n && ri.ingredient ? { ...ri, ingredient: { ...ri.ingredient, blsCode: n.blsCode, mappingStatus: n.mappingStatus, nutritionPer100g: n.nutritionPer100g } } : ri; }) };
  const p = recipePerServing(withN);
  const q = dataQuality(p, 'ENERCC');
  if (q !== 'bls_calculated') incomplete += 1;
  const missing = withN.ingredients.filter((ri) => ri.quantityInGrams && !ri.ingredient?.nutritionPer100g && !ri.ingredient?.nutritionNegligible).map((ri) => ri.ingredientId);
  console.log(
    `${r.slug.padEnd(46)} ${String(Math.round(p.values.ENERCC)).padStart(4)} kcal  P ${p.values.PROT625.toFixed(0).padStart(3)} g  KH ${p.values.CHO.toFixed(0).padStart(3)} g  F ${p.values.FAT.toFixed(0).padStart(3)} g  Bal ${p.values.FIBT.toFixed(0).padStart(2)} g  n3 ${p.values.FAPUN3.toFixed(2)} n6 ${p.values.FAPUN6.toFixed(2)} (${omegaRatio(p).text})  ${q === 'bls_calculated' ? 'ok' : 'UNVOLLST: ' + missing.join(',')}`,
  );
}
console.log(`\n${RECIPES.length} Rezepte, davon ${incomplete} mit unvollständigen Nährwerten.`);
