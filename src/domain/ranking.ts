import type { Recipe } from '@/types/recipe';

/**
 * Transparenter Ranking-Algorithmus für den Entdecken-Stapel (MVP).
 *
 * Idee: Tags, die der Nutzer häufig geliked / favorisiert / eingeplant hat,
 * erhalten Gewicht. Gleichzeitig wird Vielfalt erzwungen: Jeder n-te Platz
 * ist für ein „Entdeckungs“-Rezept reserviert, das NICHT zu den Lieblings-Tags
 * passt, damit keine Filterblase entsteht. Bereits gesehene Rezepte rutschen
 * nach hinten, Dislikes weit nach hinten.
 */
export interface UserSignals {
  liked: Set<string>;
  disliked: Set<string>;
  favorites: Set<string>;
  planned: Set<string>;
  seen: Set<string>;
}

export const EMPTY_SIGNALS: UserSignals = {
  liked: new Set(),
  disliked: new Set(),
  favorites: new Set(),
  planned: new Set(),
  seen: new Set(),
};

export interface RankingOptions {
  /** Jeder `explorationEvery`-te Platz ist ein Entdeckungs-Slot (Standard 4) */
  explorationEvery?: number;
  /** Deterministischer Zufall für Tests */
  random?: () => number;
}

export function computeTagWeights(recipes: Recipe[], signals: UserSignals): Map<string, number> {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const weights = new Map<string, number>();
  const add = (ids: Set<string>, w: number) => {
    for (const id of ids) {
      const r = byId.get(id);
      if (!r) continue;
      for (const t of r.tags) weights.set(t, (weights.get(t) ?? 0) + w);
    }
  };
  add(signals.liked, 1);
  add(signals.favorites, 2);
  add(signals.planned, 3);
  // Dislikes ziehen leicht ab
  for (const id of signals.disliked) {
    const r = byId.get(id);
    if (!r) continue;
    for (const t of r.tags) weights.set(t, (weights.get(t) ?? 0) - 0.5);
  }
  return weights;
}

export function scoreRecipe(recipe: Recipe, weights: Map<string, number>): number {
  let score = 0;
  for (const t of recipe.tags) score += weights.get(t) ?? 0;
  // Normalisierung, damit Rezepte mit vielen Tags nicht automatisch gewinnen
  return recipe.tags.length ? score / Math.sqrt(recipe.tags.length) : 0;
}

export function rankRecipes(recipes: Recipe[], signals: UserSignals, opts: RankingOptions = {}): Recipe[] {
  const explorationEvery = opts.explorationEvery ?? 4;
  const random = opts.random ?? Math.random;
  const weights = computeTagWeights(recipes, signals);

  const candidates = recipes.filter(
    (r) => !signals.favorites.has(r.id) && !signals.disliked.has(r.id),
  );
  const unseen = candidates.filter((r) => !signals.seen.has(r.id));
  const seen = candidates.filter((r) => signals.seen.has(r.id));

  const scored = unseen
    .map((r) => ({ r, s: scoreRecipe(r, weights) + random() * 0.5 }))
    .sort((a, b) => b.s - a.s);

  const hasPreferences = weights.size > 0;
  if (!hasPreferences) {
    // Kalter Start: einfach mischen
    return [...shuffle(unseen, random), ...shuffle(seen, random)];
  }

  // Aufteilen in „passt zu Vorlieben“ (score > 0) und „Entdeckung“ (score <= 0)
  const matching = scored.filter((x) => x.s > 0.5).map((x) => x.r);
  const exploration = shuffle(
    scored.filter((x) => x.s <= 0.5).map((x) => x.r),
    random,
  );

  const result: Recipe[] = [];
  let mi = 0;
  let ei = 0;
  let position = 1;
  while (mi < matching.length || ei < exploration.length) {
    const takeExploration =
      (position % explorationEvery === 0 && ei < exploration.length) || mi >= matching.length;
    if (takeExploration && ei < exploration.length) {
      result.push(exploration[ei++]!);
    } else {
      result.push(matching[mi++]!);
    }
    position += 1;
  }
  return [...result, ...shuffle(seen, random)];
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
