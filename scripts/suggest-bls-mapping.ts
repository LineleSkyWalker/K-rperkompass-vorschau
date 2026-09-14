/**
 * Schlägt für jede Katalog-Zutat einen BLS-4.0-Eintrag vor.
 *
 *   npm run bls:import -- --local-only   (erzeugt data/bls/bls-4.0.json)
 *   npm run recipes:map                  (dieses Skript)
 *
 * Ergebnis:
 *   data/ingredient-mapping.json        – Vorschläge + Status (suggested/verified/rejected), editierbar
 *   data/bls/ingredient-nutrition.json  – Nährwerte pro 100 g je Zutat für die App (nur App-relevante Codes)
 *
 * Regeln:
 *  - Bereits als "verified" oder "rejected" markierte Einträge werden NICHT überschrieben.
 *  - Bei unklaren Treffern (Score < Schwelle) wird "unmapped" gesetzt und im Report gelistet – nie geraten.
 *  - Es werden Top-3-Kandidaten mit angezeigt, damit die Prüfung im Admin schnell geht.
 */
import fs from 'node:fs';
import path from 'node:path';
import { INGREDIENTS } from '../data/ingredients';
import { NUTRIENT_CODES } from '../src/types/nutrition';

interface BlsCache {
  source: string;
  license: string;
  doi: string;
  version: string;
  importedAt: string;
  foods: { blsCode: string; nameDe: string; nameEn: string | null; nutrients: Record<string, number> }[];
}

interface MappingEntry {
  ingredientId: string;
  ingredientName: string;
  blsHint: string;
  blsCode: string | null;
  blsName: string | null;
  score: number;
  status: 'unmapped' | 'suggested' | 'verified' | 'rejected';
  candidates: { blsCode: string; name: string; score: number }[];
  note?: string;
}

const CACHE_PATH = path.resolve('data/bls/bls-4.0.json');
const MAPPING_PATH = path.resolve('data/ingredient-mapping.json');
const OUT_PATH = path.resolve('data/bls/ingredient-nutrition.json');
const MIN_SCORE = 0.55;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9%,\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s).split(/[\s,]+/).filter((t) => t.length > 1);
}

/** Einfacher, nachvollziehbarer Score: Token-Überlappung + Bonus für Präfix-Treffer + Malus für lange Namen. */
function score(hint: string, food: { nameDe: string }): number {
  const h = tokens(hint);
  const n = tokens(food.nameDe);
  if (!h.length || !n.length) return 0;
  let hits = 0;
  for (const t of h) if (n.some((x) => x === t || x.startsWith(t) || t.startsWith(x))) hits += 1;
  const recall = hits / h.length;
  const precision = hits / n.length;
  const first = normalize(food.nameDe).startsWith(h[0]!) ? 0.15 : 0;
  // Zubereitete/ungewöhnliche Varianten leicht abwerten, wenn nicht im Hint gefordert
  const penalty = /(gegart|gebraten|frittiert|konserve|tiefgefroren|getrocknet|pulver|geraeuchert)/.test(normalize(food.nameDe)) && !/(gegart|gebraten|konserve|tiefgefroren|getrocknet|pulver|geraeuchert|gerauchert)/.test(normalize(hint)) ? 0.15 : 0;
  return Math.max(0, 0.6 * recall + 0.25 * precision + first - penalty);
}

function main() {
  if (!fs.existsSync(CACHE_PATH)) {
    console.error(`BLS-Cache fehlt: ${CACHE_PATH}\nZuerst ausführen: npm run bls:import -- --local-only`);
    process.exit(1);
  }
  const cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) as BlsCache;
  const existing: Record<string, MappingEntry> = fs.existsSync(MAPPING_PATH)
    ? Object.fromEntries((JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf8')) as MappingEntry[]).map((m) => [m.ingredientId, m]))
    : {};

  const result: MappingEntry[] = [];
  const unresolved: string[] = [];

  for (const ing of INGREDIENTS) {
    const prev = existing[ing.id];
    if (prev && (prev.status === 'verified' || prev.status === 'rejected')) {
      result.push(prev);
      continue;
    }
    const scored = cache.foods
      .map((f) => ({ f, s: score(ing.blsHint, f) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
    const best = scored[0];
    const ok = best && best.s >= MIN_SCORE;
    if (!ok) unresolved.push(`${ing.id} („${ing.blsHint}“) – bester Treffer: ${best ? `${best.f.nameDe} (${best.s.toFixed(2)})` : 'keiner'}`);
    result.push({
      ingredientId: ing.id,
      ingredientName: ing.name,
      blsHint: ing.blsHint,
      blsCode: ok ? best.f.blsCode : null,
      blsName: ok ? best.f.nameDe : null,
      score: best ? Number(best.s.toFixed(3)) : 0,
      status: ok ? 'suggested' : 'unmapped',
      candidates: scored.map((x) => ({ blsCode: x.f.blsCode, name: x.f.nameDe, score: Number(x.s.toFixed(3)) })),
      note: ok ? undefined : 'Mapping erforderlich – bitte im Admin prüfen',
    });
  }

  fs.writeFileSync(MAPPING_PATH, JSON.stringify(result, null, 2));

  // App-Nährwertdatei: nur Zutaten mit suggested/verified, nur App-Codes, fehlende Werte = null
  const byCode = new Map(cache.foods.map((f) => [f.blsCode, f]));
  const ingredients: Record<string, unknown> = {};
  for (const m of result) {
    if (!m.blsCode || (m.status !== 'suggested' && m.status !== 'verified')) continue;
    const food = byCode.get(m.blsCode);
    if (!food) continue;
    const nutritionPer100g: Record<string, number | null> = {};
    for (const code of NUTRIENT_CODES) nutritionPer100g[code] = food.nutrients[code] ?? null;
    ingredients[m.ingredientId] = { blsCode: m.blsCode, blsName: food.nameDe, mappingStatus: m.status, nutritionPer100g };
  }
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify(
      {
        status: 'generated',
        source: `${cache.source} (BLS ${cache.version}, CC BY 4.0, DOI ${cache.doi})`,
        generatedAt: new Date().toISOString(),
        note: 'Automatisch aus data/ingredient-mapping.json erzeugt. Nicht von Hand bearbeiten.',
        ingredients,
      },
      null,
      0,
    ),
  );

  const counts = result.reduce<Record<string, number>>((acc, m) => ((acc[m.status] = (acc[m.status] ?? 0) + 1), acc), {});
  console.log(`Zutaten: ${result.length}`, counts);
  console.log(`Mapping geschrieben: ${MAPPING_PATH}`);
  console.log(`App-Nährwerte geschrieben: ${OUT_PATH} (${Object.keys(ingredients).length} Zutaten)`);
  if (unresolved.length) {
    console.log(`\nMapping erforderlich (${unresolved.length}):\n  ` + unresolved.join('\n  '));
  }
}

main();
