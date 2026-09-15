/**
 * Schreibt Tags, Zutaten (inkl. BLS-Zuordnung aus data/ingredient-mapping.json)
 * und Rezepte nach Supabase und berechnet den Nährwert-Cache (recipe_nutrition).
 *
 *   npm run recipes:seed
 *
 * Env: SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Voraussetzung: Migrationen ausgeführt; für Nährwerte zusätzlich `npm run bls:import`.
 * Idempotent: Upsert über slug/id.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { TAGS } from '../src/data/tags';
import { recipePerServing, dataQuality } from '../src/domain/nutrition';
import { NUTRIENT_CODES } from '../src/types/nutrition';
import type { NutrientValues } from '../src/types/nutrition';

interface MappingEntry { ingredientId: string; blsCode: string | null; status: string; note?: string }

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY setzen.');
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const mappingPath = path.resolve('data/ingredient-mapping.json');
  const mapping: Record<string, MappingEntry> = fs.existsSync(mappingPath)
    ? Object.fromEntries((JSON.parse(fs.readFileSync(mappingPath, 'utf8')) as MappingEntry[]).map((m) => [m.ingredientId, m]))
    : {};

  // 1) Tags
  const { error: tagErr } = await sb.from('tag').upsert(
    TAGS.map((t) => ({ id: t.id, label: t.label, category: t.category, sort_order: t.sortOrder, active: t.active })),
    { onConflict: 'id' },
  );
  if (tagErr) throw tagErr;
  console.log(`Tags: ${TAGS.length}`);

  // 2) Zutaten (Slug = Katalog-ID); BLS-Code nur, wenn er in bls_food existiert
  const { data: blsCodes } = await sb.from('bls_food').select('bls_code');
  const known = new Set((blsCodes ?? []).map((r) => r.bls_code as string));
  const { error: ingErr } = await sb.from('ingredient').upsert(
    INGREDIENTS.map((i) => {
      const m = mapping[i.id];
      const code = m?.blsCode && known.has(m.blsCode) ? m.blsCode : null;
      return {
        slug: i.id,
        canonical_name: i.name,
        plural_name: i.plural ?? null,
        shopping_category: i.category,
        grams_per_piece: i.gramsPerPiece ?? null,
        grams_per_tablespoon: i.gramsPerTablespoon ?? null,
        grams_per_teaspoon: i.gramsPerTeaspoon ?? null,
        density_g_per_ml: i.densityGPerMl ?? null,
        allergens: i.allergens ?? [],
        nutrition_negligible: i.nutritionNegligible ?? false,
        bls_code: code,
        mapping_status: code ? (m!.status === 'verified' ? 'verified' : 'suggested') : 'unmapped',
        mapping_note: code ? null : (m?.note ?? 'Mapping erforderlich'),
      };
    }),
    { onConflict: 'slug' },
  );
  if (ingErr) throw ingErr;
  const { data: ingRows } = await sb.from('ingredient').select('id, slug, bls_code, mapping_status, bls_food(nutrients)');
  const ingBySlug = new Map((ingRows ?? []).map((r) => [r.slug as string, r]));
  console.log(`Zutaten: ${ingBySlug.size}, davon mit BLS-Code: ${(ingRows ?? []).filter((r) => r.bls_code).length}`);

  // 3) Rezepte
  let count = 0;
  for (const r of RECIPES) {
    const { data: rec, error } = await sb
      .from('recipe')
      .upsert(
        {
          slug: r.slug,
          title: r.title,
          short_description: r.shortDescription,
          image_url: r.image?.url || null,
          image_source_type: r.image?.sourceType ?? 'placeholder',
          image_source_name: r.image?.sourceName ?? null,
          image_license: r.image?.license ?? null,
          image_attribution: r.image?.attribution ?? null,
          image_source_url: r.image?.sourceUrl ?? null,
          meal_types: r.mealTypes,
          cuisine: r.cuisine ?? null,
          prep_time_minutes: r.prepTimeMinutes,
          cook_time_minutes: r.cookTimeMinutes,
          difficulty: r.difficulty,
          default_servings: r.defaultServings,
          allergens: r.allergens,
          keeps_days: r.keepsDays ?? null,
          freezable: r.freezable ?? false,
          source_type: r.sourceType,
          source_name: r.sourceName ?? null,
          status: r.status,
        },
        { onConflict: 'slug' },
      )
      .select('id')
      .single();
    if (error || !rec) throw error ?? new Error(`Rezept ${r.slug} fehlgeschlagen`);
    const recipeId = rec.id as string;

    await sb.from('recipe_tag').delete().eq('recipe_id', recipeId);
    await sb.from('recipe_tag').insert(r.tags.map((tag_id) => ({ recipe_id: recipeId, tag_id })));

    await sb.from('recipe_ingredient').delete().eq('recipe_id', recipeId);
    const { error: riErr } = await sb.from('recipe_ingredient').insert(
      r.ingredients.map((ri) => {
        const ing = ingBySlug.get(ri.ingredientId);
        if (!ing) throw new Error(`Zutat ${ri.ingredientId} nicht in DB`);
        return {
          recipe_id: recipeId,
          ingredient_id: ing.id,
          quantity: ri.quantity,
          unit: ri.unit,
          quantity_in_grams: ri.quantityInGrams,
          optional: ri.optional,
          preparation_note: ri.preparationNote ?? null,
          ingredient_group: ri.group ?? null,
          sort_order: ri.sortOrder,
        };
      }),
    );
    if (riErr) throw riErr;

    await sb.from('recipe_step').delete().eq('recipe_id', recipeId);
    await sb.from('recipe_step').insert(r.steps.map((s) => ({ recipe_id: recipeId, step_number: s.stepNumber, text: s.text })));

    // 4) Nährwert-Cache: mit den DB-Nährwerten (BLS) rechnen
    const withNutrition = {
      ...r,
      ingredients: r.ingredients.map((ri) => {
        const ing = ingBySlug.get(ri.ingredientId);
        const nutrients = (ing?.bls_food as unknown as { nutrients?: Record<string, number> } | null)?.nutrients;
        const per100: NutrientValues | undefined = nutrients
          ? Object.fromEntries(NUTRIENT_CODES.map((c) => [c, nutrients[c] ?? null]))
          : undefined;
        return { ...ri, ingredient: ri.ingredient ? { ...ri.ingredient, nutritionPer100g: per100 } : undefined };
      }),
    };
    const per = recipePerServing(withNutrition);
    await sb.from('recipe_nutrition').upsert(
      {
        recipe_id: recipeId,
        per_serving: per.values,
        missing_grams: per.missingGrams,
        total_grams: per.totalGrams,
        unmapped_ingredients: per.unmappedIngredients,
        data_quality: dataQuality(per, 'ENERCC'),
      },
      { onConflict: 'recipe_id' },
    );
    count += 1;
    process.stdout.write(`\r  Rezepte: ${count}/${RECIPES.length}`);
  }
  console.log('\nFertig.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
