import type { Allergen, MealType, Recipe, UserProfile } from '@/types/recipe';

export interface RecipeFilter {
  mealTypes: MealType[];
  tags: string[]; // alle müssen zutreffen (UND)
  maxTotalMinutes: number | null;
  excludeAllergens: Allergen[];
  /** „Wonach ist mir?“ – Stimmungs-Tags, mindestens eines muss zutreffen (ODER) */
  moods: string[];
  search: string;
}

export const EMPTY_FILTER: RecipeFilter = {
  mealTypes: [],
  tags: [],
  maxTotalMinutes: null,
  excludeAllergens: [],
  moods: [],
  search: '',
};

/** „Wonach ist mir gerade?“ – Antwortoptionen → Tag-IDs */
export const MOOD_OPTIONS: { id: string; label: string; tags: string[] }[] = [
  { id: 'warm', label: 'Warm', tags: ['warm'] },
  { id: 'fresh', label: 'Frisch', tags: ['fresh'] },
  { id: 'sweet', label: 'Süß', tags: ['sweet'] },
  { id: 'savory', label: 'Herzhaft', tags: ['savory'] },
  { id: 'creamy', label: 'Cremig', tags: ['creamy'] },
  { id: 'crispy', label: 'Knusprig', tags: ['crispy'] },
  { id: 'light', label: 'Leicht', tags: ['light'] },
  { id: 'filling', label: 'Sättigend', tags: ['filling'] },
  { id: 'quick', label: 'Schnell', tags: ['under_15_min', 'under_30_min'] },
  { id: 'cozy', label: 'Gemütlich', tags: ['comfort_food', 'warm'] },
  { id: 'special', label: 'Etwas Besonderes', tags: ['special'] },
  { id: 'comfort', label: 'Comfort Food', tags: ['comfort_food'] },
];

export function applyFilter(recipes: Recipe[], filter: RecipeFilter, profile?: UserProfile | null): Recipe[] {
  const allergens = new Set<Allergen>([...filter.excludeAllergens, ...(profile?.allergens ?? [])]);
  const dietTags = profile?.dietaryPreferences ?? [];
  const search = filter.search.trim().toLowerCase();
  const moodTags = new Set(
    filter.moods.flatMap((m) => MOOD_OPTIONS.find((o) => o.id === m)?.tags ?? []),
  );

  return recipes.filter((r) => {
    if (r.status !== 'published') return false;
    if (filter.mealTypes.length && !filter.mealTypes.some((m) => r.mealTypes.includes(m))) return false;
    if (filter.tags.length && !filter.tags.every((t) => r.tags.includes(t))) return false;
    if (filter.maxTotalMinutes !== null && r.totalTimeMinutes > filter.maxTotalMinutes) return false;
    if (allergens.size && r.allergens.some((a) => allergens.has(a))) return false;
    // vegan impliziert vegetarisch: wer vegetarisch will, akzeptiert auch vegane Rezepte
    if (dietTags.includes('vegan') && !r.tags.includes('vegan')) return false;
    if (dietTags.includes('vegetarian') && !dietTags.includes('vegan') && !(r.tags.includes('vegetarian') || r.tags.includes('vegan'))) return false;
    if (moodTags.size && !r.tags.some((t) => moodTags.has(t))) return false;
    if (search && !(r.title.toLowerCase().includes(search) || r.shortDescription.toLowerCase().includes(search))) return false;
    return true;
  });
}

export function isFilterActive(f: RecipeFilter): boolean {
  return (
    f.mealTypes.length > 0 ||
    f.tags.length > 0 ||
    f.maxTotalMinutes !== null ||
    f.excludeAllergens.length > 0 ||
    f.moods.length > 0 ||
    f.search.trim().length > 0
  );
}
