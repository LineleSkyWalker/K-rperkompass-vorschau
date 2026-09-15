import { rankRecipes, EMPTY_SIGNALS, computeTagWeights } from '../ranking';
import { applyFilter, EMPTY_FILTER } from '../filters';
import { recipe } from './fixtures';

const pastaA = recipe({ id: 'pastaA', tags: ['vegetarian', 'under_30_min', 'warm', 'pasta'] });
const pastaB = recipe({ id: 'pastaB', tags: ['vegetarian', 'under_30_min', 'warm', 'pasta'] });
const pastaC = recipe({ id: 'pastaC', tags: ['vegetarian', 'warm', 'pasta'] });
const salad = recipe({ id: 'salad', tags: ['fresh', 'cold', 'light'] });
const cake = recipe({ id: 'cake', tags: ['sweet', 'baking'] });
const soup = recipe({ id: 'soup', tags: ['warm', 'comfort_food'] });
const all = [pastaA, pastaB, pastaC, salad, cake, soup];

// deterministischer Zufall
function seeded(seed = 1) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('rankRecipes', () => {
  it('schließt Favoriten und Dislikes aus dem Stapel aus', () => {
    const out = rankRecipes(all, { ...EMPTY_SIGNALS, favorites: new Set(['cake']), disliked: new Set(['soup']) }, { random: seeded() });
    expect(out.map((r) => r.id)).not.toContain('cake');
    expect(out.map((r) => r.id)).not.toContain('soup');
  });

  it('bevorzugt Rezepte mit gelikten Tags, mischt aber Entdeckungen ein (keine Filterblase)', () => {
    // pastaA wurde favorisiert + eingeplant → ist selbst nicht mehr im Stapel, prägt aber die Gewichte
    const signals = { ...EMPTY_SIGNALS, favorites: new Set(['pastaA']), planned: new Set(['pastaA']) };
    const out = rankRecipes(all, signals, { random: seeded(3), explorationEvery: 3 });
    const ids = out.map((r) => r.id);
    // Erste zwei sind Pasta (passt zu Vorlieben)
    expect(ids.slice(0, 2).every((id) => id.startsWith('pasta'))).toBe(true);
    // Platz 3 ist ein Entdeckungs-Slot: kein Pasta
    expect(ids[2]!.startsWith('pasta')).toBe(false);
  });

  it('schiebt bereits gesehene Rezepte nach hinten', () => {
    const out = rankRecipes(all, { ...EMPTY_SIGNALS, seen: new Set(['pastaA', 'pastaB']) }, { random: seeded() });
    const ids = out.map((r) => r.id);
    expect(ids.indexOf('pastaA')).toBeGreaterThanOrEqual(4);
    expect(ids.indexOf('pastaB')).toBeGreaterThanOrEqual(4);
  });

  it('gewichtet geplante Rezepte stärker als Likes', () => {
    const w = computeTagWeights(all, { ...EMPTY_SIGNALS, liked: new Set(['salad']), planned: new Set(['cake']) });
    expect(w.get('sweet')).toBe(3);
    expect(w.get('fresh')).toBe(1);
  });
});

describe('applyFilter', () => {
  it('filtert nach Mahlzeit, Tags, Zeit und Allergenen', () => {
    const breakfast = recipe({ id: 'b', mealTypes: ['breakfast'], tags: ['sweet'], totalTimeMinutes: 10, allergens: ['milk'] });
    const dinner = recipe({ id: 'd', mealTypes: ['dinner'], tags: ['savory', 'warm'], totalTimeMinutes: 45, allergens: ['gluten'] });
    expect(applyFilter([breakfast, dinner], { ...EMPTY_FILTER, mealTypes: ['breakfast'] }).map((r) => r.id)).toEqual(['b']);
    expect(applyFilter([breakfast, dinner], { ...EMPTY_FILTER, tags: ['warm'] }).map((r) => r.id)).toEqual(['d']);
    expect(applyFilter([breakfast, dinner], { ...EMPTY_FILTER, maxTotalMinutes: 30 }).map((r) => r.id)).toEqual(['b']);
    expect(applyFilter([breakfast, dinner], { ...EMPTY_FILTER, excludeAllergens: ['milk'] }).map((r) => r.id)).toEqual(['d']);
  });

  it('berücksichtigt Profil: vegan zeigt nur vegane, vegetarisch auch vegane Rezepte', () => {
    const veg = recipe({ id: 'veg', tags: ['vegetarian'] });
    const vegan = recipe({ id: 'vegan', tags: ['vegan'] });
    const meat = recipe({ id: 'meat', tags: [] });
    const profile = { dietaryPreferences: ['vegetarian' as const], allergens: [], intolerances: [], familyFriendly: false, preferredMaxCookTime: null, defaultServings: 2, showNutrition: true, showReferenceValues: false, notificationsEnabled: false, onboardingCompleted: true, analyticsConsent: false, legalAcceptedVersion: null, userId: 'u' };
    expect(applyFilter([veg, vegan, meat], EMPTY_FILTER, profile).map((r) => r.id)).toEqual(['veg', 'vegan']);
    expect(applyFilter([veg, vegan, meat], EMPTY_FILTER, { ...profile, dietaryPreferences: ['vegan'] }).map((r) => r.id)).toEqual(['vegan']);
  });

  it('"Wonach ist mir?" ist ein ODER-Filter über Stimmungs-Tags', () => {
    expect(applyFilter(all, { ...EMPTY_FILTER, moods: ['fresh', 'sweet'] }).map((r) => r.id).sort()).toEqual(['cake', 'salad']);
  });

  it('zeigt nur veröffentlichte Rezepte', () => {
    const draft = recipe({ id: 'draft', status: 'draft' });
    expect(applyFilter([draft, salad], EMPTY_FILTER).map((r) => r.id)).toEqual(['salad']);
  });
});
