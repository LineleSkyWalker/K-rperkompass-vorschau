/**
 * Prüft alle Rezepte: Zutaten bekannt, Slugs eindeutig, Tags bekannt,
 * Gramm-Umrechnung möglich, Verteilung über Mahlzeiten.
 */
import { RECIPES } from '../data/recipes';
import { TAG_BY_ID } from '../src/data/tags';
import { INGREDIENTS } from '../data/ingredients';

const errors: string[] = [];
const warnings: string[] = [];
const slugs = new Set<string>();
const usedIngredients = new Set<string>();

for (const r of RECIPES) {
  if (slugs.has(r.slug)) errors.push(`Doppelter Slug: ${r.slug}`);
  slugs.add(r.slug);
  if (!r.mealTypes.length) errors.push(`${r.slug}: keine Mahlzeit`);
  if (r.steps.length < 1) errors.push(`${r.slug}: keine Schritte`);
  if (r.ingredients.length < 2) errors.push(`${r.slug}: zu wenige Zutaten`);
  for (const t of r.tags) if (!TAG_BY_ID[t]) errors.push(`${r.slug}: unbekannter Tag "${t}"`);
  for (const ri of r.ingredients) {
    usedIngredients.add(ri.ingredientId);
    if (ri.quantity !== null && ri.quantityInGrams === null) {
      warnings.push(`${r.slug}: "${ri.ingredient?.canonicalName}" (${ri.quantity} ${ri.unit}) nicht in Gramm umrechenbar → fließt nicht in Nährwerte/Einkaufsliste-Gramm ein`);
    }
  }
}

const byMeal: Record<string, number> = {};
for (const r of RECIPES) for (const m of r.mealTypes) byMeal[m] = (byMeal[m] ?? 0) + 1;

console.log(`Rezepte: ${RECIPES.length}`);
console.log('Nach Mahlzeit (Mehrfachnennung möglich):', byMeal);
console.log(`Vegetarisch: ${RECIPES.filter((r) => r.tags.includes('vegetarian')).length}, vegan: ${RECIPES.filter((r) => r.tags.includes('vegan')).length}`);
console.log(`Zutaten im Katalog: ${INGREDIENTS.length}, davon verwendet: ${usedIngredients.size}`);
const unused = INGREDIENTS.filter((i) => !usedIngredients.has(i.id)).map((i) => i.id);
if (unused.length) console.log(`Unbenutzte Katalog-Zutaten (${unused.length}): ${unused.join(', ')}`);
if (warnings.length) console.log(`\nHinweise (${warnings.length}):\n  ` + warnings.join('\n  '));
if (errors.length) {
  console.error(`\nFEHLER (${errors.length}):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log('\nAlle Rezepte gültig.');
