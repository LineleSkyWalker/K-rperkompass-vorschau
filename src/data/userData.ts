/**
 * Persistenz der Nutzerdaten.
 * Lokal (AsyncStorage) immer; zusätzlich Supabase-Sync, wenn angemeldet.
 * Die App funktioniert dadurch auch offline und ohne Konto.
 */
import type { MealPlanEntry, ShoppingListItem, UserProfile } from '@/types/recipe';
import { loadJson, removeKeys, saveJson } from '@/lib/storage';
import { getSupabase } from '@/lib/supabase';

export interface UserData {
  profile: UserProfile;
  favorites: string[]; // recipeIds, neueste zuerst
  liked: string[];
  disliked: string[];
  seen: string[];
  planned: string[]; // recipeIds, die je eingeplant wurden (für Ranking)
  cookedCount: Record<string, number>;
  planEntries: MealPlanEntry[];
  shoppingItems: ShoppingListItem[];
  pantry: string[]; // ingredientIds "habe ich bereits"
}

export const LOCAL_USER_ID = 'local';

export function defaultProfile(userId: string): UserProfile {
  return {
    userId,
    dietaryPreferences: [],
    allergens: [],
    intolerances: [],
    familyFriendly: false,
    preferredMaxCookTime: null,
    defaultServings: 2,
    showNutrition: true,
    showReferenceValues: false,
    notificationsEnabled: false,
    onboardingCompleted: false,
  };
}

export function emptyUserData(userId: string): UserData {
  return {
    profile: defaultProfile(userId),
    favorites: [],
    liked: [],
    disliked: [],
    seen: [],
    planned: [],
    cookedCount: {},
    planEntries: [],
    shoppingItems: [],
    pantry: [],
  };
}

const KEY = 'userdata:v1';

export async function loadLocalUserData(): Promise<UserData> {
  const data = await loadJson<UserData | null>(KEY, null);
  if (!data) return emptyUserData(LOCAL_USER_ID);
  // Vorwärtskompatibel: fehlende Felder ergänzen
  return { ...emptyUserData(data.profile?.userId ?? LOCAL_USER_ID), ...data, profile: { ...defaultProfile(LOCAL_USER_ID), ...data.profile } };
}

export async function saveLocalUserData(data: UserData): Promise<void> {
  await saveJson(KEY, data);
}

export async function clearLocalUserData(): Promise<void> {
  await removeKeys([KEY]);
}

// ---------------------------------------------------------------------------
// Supabase-Sync (best effort; Fehler werden geloggt, nicht geworfen)
// ---------------------------------------------------------------------------

export async function pullRemoteUserData(userId: string): Promise<Partial<UserData> | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const [profile, favorites, interactions, plan, shopping, pantry] = await Promise.all([
      sb.from('user_profile').select('*').eq('user_id', userId).maybeSingle(),
      sb.from('favorite').select('recipe_id, created_at, cooked_count').eq('user_id', userId).order('created_at', { ascending: false }),
      sb.from('recipe_interaction').select('recipe_id, action').eq('user_id', userId),
      sb.from('meal_plan_entry').select('*').eq('user_id', userId),
      sb.from('shopping_list_item').select('*').eq('user_id', userId),
      sb.from('pantry_item').select('ingredient_id').eq('user_id', userId),
    ]);
    const p = profile.data;
    const out: Partial<UserData> = {};
    if (p) {
      out.profile = {
        userId,
        displayName: p.display_name ?? undefined,
        dietaryPreferences: p.dietary_preferences ?? [],
        allergens: p.allergens ?? [],
        intolerances: p.intolerances ?? [],
        familyFriendly: p.family_friendly ?? false,
        preferredMaxCookTime: p.preferred_max_cook_time ?? null,
        defaultServings: p.default_servings ?? 2,
        showNutrition: p.show_nutrition ?? true,
        showReferenceValues: p.show_reference_values ?? false,
        notificationsEnabled: p.notifications_enabled ?? false,
        onboardingCompleted: p.onboarding_completed ?? false,
      };
    }
    if (favorites.data) {
      out.favorites = favorites.data.map((f) => f.recipe_id as string);
      out.cookedCount = Object.fromEntries(favorites.data.map((f) => [f.recipe_id as string, (f.cooked_count as number) ?? 0]));
    }
    if (interactions.data) {
      out.liked = interactions.data.filter((i) => i.action === 'like').map((i) => i.recipe_id as string);
      out.disliked = interactions.data.filter((i) => i.action === 'skip').map((i) => i.recipe_id as string);
      out.seen = interactions.data.filter((i) => i.action === 'seen').map((i) => i.recipe_id as string);
    }
    if (plan.data) {
      out.planEntries = plan.data.map((e) => ({
        id: e.id,
        userId,
        date: e.date,
        mealSlot: e.meal_slot,
        recipeId: e.recipe_id,
        servings: e.servings,
        servingsEaten: e.servings_eaten,
        leftoverOfEntryId: e.leftover_of_entry_id,
        notes: e.notes ?? undefined,
        createdAt: e.created_at,
      }));
      out.planned = [...new Set(out.planEntries.map((e) => e.recipeId))];
    }
    if (shopping.data) {
      out.shoppingItems = shopping.data.map((s) => ({
        id: s.id,
        userId,
        ingredientId: s.ingredient_id,
        name: s.name,
        quantity: s.quantity,
        unit: s.unit,
        quantityInGrams: s.quantity_in_grams,
        category: s.category,
        checked: s.checked,
        alreadyHave: s.already_have,
        fromRecipeIds: s.from_recipe_ids ?? [],
        manual: s.manual,
      }));
    }
    if (pantry.data) out.pantry = pantry.data.map((x) => x.ingredient_id as string);
    return out;
  } catch (e) {
    console.warn('Remote-Nutzerdaten konnten nicht geladen werden', e);
    return null;
  }
}

/** Schreibt den kompletten Nutzerzustand nach Supabase (idempotent per upsert/delete). */
export async function pushRemoteUserData(userId: string, data: UserData): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    await sb.from('user_profile').update({
      display_name: data.profile.displayName ?? null,
      dietary_preferences: data.profile.dietaryPreferences,
      allergens: data.profile.allergens,
      intolerances: data.profile.intolerances,
      family_friendly: data.profile.familyFriendly,
      preferred_max_cook_time: data.profile.preferredMaxCookTime,
      default_servings: data.profile.defaultServings,
      show_nutrition: data.profile.showNutrition,
      show_reference_values: data.profile.showReferenceValues,
      notifications_enabled: data.profile.notificationsEnabled,
      onboarding_completed: data.profile.onboardingCompleted,
    }).eq('user_id', userId);

    await sb.from('favorite').delete().eq('user_id', userId);
    if (data.favorites.length) {
      await sb.from('favorite').insert(
        data.favorites.map((recipe_id) => ({ user_id: userId, recipe_id, cooked_count: data.cookedCount[recipe_id] ?? 0 })),
      );
    }

    await sb.from('recipe_interaction').delete().eq('user_id', userId);
    const interactions = [
      ...data.liked.map((recipe_id) => ({ user_id: userId, recipe_id, action: 'like' })),
      ...data.disliked.map((recipe_id) => ({ user_id: userId, recipe_id, action: 'skip' })),
      ...data.seen.map((recipe_id) => ({ user_id: userId, recipe_id, action: 'seen' })),
    ];
    if (interactions.length) await sb.from('recipe_interaction').insert(interactions);

    await sb.from('meal_plan_entry').delete().eq('user_id', userId);
    if (data.planEntries.length) {
      await sb.from('meal_plan_entry').insert(
        data.planEntries.map((e) => ({
          id: e.id,
          user_id: userId,
          date: e.date,
          meal_slot: e.mealSlot,
          recipe_id: e.recipeId,
          servings: e.servings,
          servings_eaten: e.servingsEaten,
          leftover_of_entry_id: e.leftoverOfEntryId ?? null,
          notes: e.notes ?? null,
        })),
      );
    }

    await sb.from('shopping_list_item').delete().eq('user_id', userId);
    if (data.shoppingItems.length) {
      await sb.from('shopping_list_item').insert(
        data.shoppingItems.map((s) => ({
          id: s.id,
          user_id: userId,
          ingredient_id: s.ingredientId,
          name: s.name,
          quantity: s.quantity,
          unit: s.unit,
          quantity_in_grams: s.quantityInGrams,
          category: s.category,
          checked: s.checked,
          already_have: s.alreadyHave,
          from_recipe_ids: s.fromRecipeIds,
          manual: s.manual,
        })),
      );
    }

    await sb.from('pantry_item').delete().eq('user_id', userId);
    if (data.pantry.length) {
      await sb.from('pantry_item').insert(data.pantry.map((ingredient_id) => ({ user_id: userId, ingredient_id })));
    }
  } catch (e) {
    console.warn('Sync nach Supabase fehlgeschlagen (Daten bleiben lokal erhalten)', e);
  }
}
