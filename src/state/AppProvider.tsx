import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { MealPlanEntry, MealType, Recipe, ShoppingListItem, UserProfile } from '@/types/recipe';
import { loadRecipes } from '@/data/recipeSource';
import {
  clearLocalUserData,
  emptyUserData,
  loadLocalUserData,
  LOCAL_USER_ID,
  pullRemoteUserData,
  pushRemoteUserData,
  saveLocalUserData,
  type UserData,
} from '@/data/userData';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { newId } from '@/lib/ids';
import { buildShoppingList, mergeWithSavedState } from '@/domain/shoppingList';
import { track } from '@/lib/analytics';

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
type Action =
  | { type: 'hydrate'; data: UserData }
  | { type: 'profile'; patch: Partial<UserProfile> }
  | { type: 'swipe'; recipeId: string; action: 'like' | 'skip' }
  | { type: 'seen'; recipeId: string }
  | { type: 'favorite'; recipeId: string; on: boolean }
  | { type: 'cooked'; recipeId: string }
  | { type: 'plan.add'; entry: MealPlanEntry }
  | { type: 'plan.update'; id: string; patch: Partial<MealPlanEntry> }
  | { type: 'plan.remove'; id: string }
  | { type: 'plan.clearWeek'; dates: string[] }
  | { type: 'shopping.set'; items: ShoppingListItem[] }
  | { type: 'shopping.toggle'; id: string; field: 'checked' | 'alreadyHave' }
  | { type: 'shopping.addManual'; item: ShoppingListItem }
  | { type: 'shopping.remove'; id: string }
  | { type: 'shopping.clearChecked' }
  | { type: 'pantry.toggle'; ingredientId: string }
  | { type: 'reset'; userId: string };

function uniqPrepend(list: string[], id: string): string[] {
  return [id, ...list.filter((x) => x !== id)];
}

function reducer(state: UserData, action: Action): UserData {
  switch (action.type) {
    case 'hydrate':
      return action.data;
    case 'reset':
      return emptyUserData(action.userId);
    case 'profile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'seen':
      return state.seen.includes(action.recipeId) ? state : { ...state, seen: [...state.seen, action.recipeId] };
    case 'swipe': {
      const seen = state.seen.includes(action.recipeId) ? state.seen : [...state.seen, action.recipeId];
      if (action.action === 'like') {
        return {
          ...state,
          seen,
          liked: uniqPrepend(state.liked, action.recipeId),
          disliked: state.disliked.filter((x) => x !== action.recipeId),
          favorites: uniqPrepend(state.favorites, action.recipeId),
        };
      }
      return {
        ...state,
        seen,
        disliked: uniqPrepend(state.disliked, action.recipeId),
        liked: state.liked.filter((x) => x !== action.recipeId),
      };
    }
    case 'favorite':
      return {
        ...state,
        favorites: action.on ? uniqPrepend(state.favorites, action.recipeId) : state.favorites.filter((x) => x !== action.recipeId),
        disliked: action.on ? state.disliked.filter((x) => x !== action.recipeId) : state.disliked,
      };
    case 'cooked':
      return { ...state, cookedCount: { ...state.cookedCount, [action.recipeId]: (state.cookedCount[action.recipeId] ?? 0) + 1 } };
    case 'plan.add':
      return { ...state, planEntries: [...state.planEntries, action.entry], planned: uniqPrepend(state.planned, action.entry.recipeId) };
    case 'plan.update':
      return { ...state, planEntries: state.planEntries.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) };
    case 'plan.remove':
      return {
        ...state,
        planEntries: state.planEntries
          .filter((e) => e.id !== action.id)
          // Reste-Einträge, die auf den gelöschten Eintrag zeigen, werden zu normalen Einträgen
          .map((e) => (e.leftoverOfEntryId === action.id ? { ...e, leftoverOfEntryId: null } : e)),
      };
    case 'plan.clearWeek':
      return { ...state, planEntries: state.planEntries.filter((e) => !action.dates.includes(e.date)) };
    case 'shopping.set':
      return { ...state, shoppingItems: action.items };
    case 'shopping.toggle':
      return {
        ...state,
        shoppingItems: state.shoppingItems.map((i) => (i.id === action.id ? { ...i, [action.field]: !i[action.field] } : i)),
      };
    case 'shopping.addManual':
      return { ...state, shoppingItems: [...state.shoppingItems, action.item] };
    case 'shopping.remove':
      return { ...state, shoppingItems: state.shoppingItems.filter((i) => i.id !== action.id) };
    case 'shopping.clearChecked':
      return { ...state, shoppingItems: state.shoppingItems.filter((i) => !i.checked) };
    case 'pantry.toggle':
      return {
        ...state,
        pantry: state.pantry.includes(action.ingredientId)
          ? state.pantry.filter((x) => x !== action.ingredientId)
          : [...state.pantry, action.ingredientId],
      };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export interface AppContextValue {
  ready: boolean;
  recipes: Recipe[];
  recipeById: Map<string, Recipe>;
  recipeSource: 'local' | 'supabase';
  loadError: string | null;
  reloadRecipes: () => Promise<void>;
  data: UserData;
  session: Session | null;
  isSupabase: boolean;
  // Aktionen
  updateProfile: (patch: Partial<UserProfile>) => void;
  swipe: (recipeId: string, action: 'like' | 'skip') => void;
  markSeen: (recipeId: string) => void;
  toggleFavorite: (recipeId: string) => void;
  markCooked: (recipeId: string) => void;
  addToPlan: (input: { recipeId: string; date: string; mealSlot: MealType; servings: number; servingsEaten?: number; leftoverOfEntryId?: string | null }) => MealPlanEntry;
  updatePlanEntry: (id: string, patch: Partial<MealPlanEntry>) => void;
  removePlanEntry: (id: string) => void;
  clearWeek: (dates: string[]) => void;
  regenerateShoppingList: (dates: string[]) => void;
  toggleShoppingItem: (id: string, field: 'checked' | 'alreadyHave') => void;
  addManualShoppingItem: (name: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCheckedShoppingItems: () => void;
  togglePantry: (ingredientId: string) => void;
  // Auth
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteMyData: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, emptyUserData(LOCAL_USER_ID));
  const [ready, setReady] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeSource, setRecipeSource] = useState<'local' | 'supabase'>('local');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const hydrated = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reloadRecipes = useCallback(async () => {
    try {
      const r = await loadRecipes();
      setRecipes(r.recipes);
      setRecipeSource(r.source);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Rezepte konnten nicht geladen werden.');
    }
  }, []);

  // Initial: lokale Daten + Rezepte laden, Auth-Session beobachten
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [local] = await Promise.all([loadLocalUserData(), reloadRecipes()]);
      if (cancelled) return;
      dispatch({ type: 'hydrate', data: local });
      hydrated.current = true;
      setReady(true);
    })();
    const sb = getSupabase();
    if (sb) {
      sb.auth.getSession().then(({ data }) => setSession(data.session));
      const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
      return () => {
        cancelled = true;
        sub.subscription.unsubscribe();
      };
    }
    return () => {
      cancelled = true;
    };
  }, [reloadRecipes]);

  // Wenn eingeloggt: Remote-Daten holen und mit lokalen zusammenführen (Remote gewinnt bei Konflikt)
  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const remote = await pullRemoteUserData(session.user.id);
      if (!remote) return;
      const merged: UserData = { ...state, ...remote, profile: { ...state.profile, ...(remote.profile ?? {}), userId: session.user.id } };
      dispatch({ type: 'hydrate', data: merged });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Persistieren (lokal sofort, remote entprellt)
  useEffect(() => {
    if (!hydrated.current) return;
    saveLocalUserData(state);
    if (session?.user) {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => pushRemoteUserData(session.user.id, state), 1500);
    }
  }, [state, session]);

  const recipeById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const value: AppContextValue = useMemo(
    () => ({
      ready,
      recipes,
      recipeById,
      recipeSource,
      loadError,
      reloadRecipes,
      data: state,
      session,
      isSupabase: isSupabaseConfigured,
      updateProfile: (patch) => dispatch({ type: 'profile', patch }),
      swipe: (recipeId, action) => {
        dispatch({ type: 'swipe', recipeId, action });
        track(action === 'like' ? { type: 'swipe_like', recipeId } : { type: 'swipe_dislike', recipeId });
        if (action === 'like') track({ type: 'favorite_added', recipeId });
      },
      markSeen: (recipeId) => dispatch({ type: 'seen', recipeId }),
      toggleFavorite: (recipeId) => {
        const on = !state.favorites.includes(recipeId);
        dispatch({ type: 'favorite', recipeId, on });
        track(on ? { type: 'favorite_added', recipeId } : { type: 'favorite_removed', recipeId });
      },
      markCooked: (recipeId) => dispatch({ type: 'cooked', recipeId }),
      addToPlan: (input) => {
        const entry: MealPlanEntry = {
          id: newId(),
          userId: state.profile.userId,
          date: input.date,
          mealSlot: input.mealSlot,
          recipeId: input.recipeId,
          servings: input.servings,
          servingsEaten: input.servingsEaten ?? input.servings,
          leftoverOfEntryId: input.leftoverOfEntryId ?? null,
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'plan.add', entry });
        track({ type: 'recipe_added_to_planner', recipeId: input.recipeId, mealSlot: input.mealSlot });
        return entry;
      },
      updatePlanEntry: (id, patch) => dispatch({ type: 'plan.update', id, patch }),
      removePlanEntry: (id) => dispatch({ type: 'plan.remove', id }),
      clearWeek: (dates) => dispatch({ type: 'plan.clearWeek', dates }),
      regenerateShoppingList: (dates) => {
        const entries = state.planEntries
          .filter((e) => dates.includes(e.date))
          .map((e) => ({ ...e, recipe: recipeById.get(e.recipeId) }));
        const generated = buildShoppingList(entries).filter((g) => !g.ingredientId || !state.pantry.includes(g.ingredientId));
        const items = mergeWithSavedState(generated, state.shoppingItems, state.profile.userId, () => newId());
        dispatch({ type: 'shopping.set', items });
        track({ type: 'shopping_list_generated', itemCount: items.length });
      },
      toggleShoppingItem: (id, field) => dispatch({ type: 'shopping.toggle', id, field }),
      addManualShoppingItem: (name) =>
        dispatch({
          type: 'shopping.addManual',
          item: {
            id: newId(),
            userId: state.profile.userId,
            ingredientId: null,
            name,
            quantity: null,
            unit: null,
            quantityInGrams: null,
            category: 'other',
            checked: false,
            alreadyHave: false,
            fromRecipeIds: [],
            manual: true,
          },
        }),
      removeShoppingItem: (id) => dispatch({ type: 'shopping.remove', id }),
      clearCheckedShoppingItems: () => dispatch({ type: 'shopping.clearChecked' }),
      togglePantry: (ingredientId) => dispatch({ type: 'pantry.toggle', ingredientId }),
      signInWithEmail: async (email) => {
        const sb = getSupabase();
        if (!sb) return { error: 'Kein Server konfiguriert – die App läuft im lokalen Modus.' };
        const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        const sb = getSupabase();
        if (sb) await sb.auth.signOut();
        setSession(null);
      },
      deleteMyData: async () => {
        const sb = getSupabase();
        if (sb && session?.user) await sb.rpc('delete_my_data');
        await clearLocalUserData();
        dispatch({ type: 'reset', userId: session?.user?.id ?? LOCAL_USER_ID });
      },
      deleteAccount: async () => {
        const sb = getSupabase();
        if (!sb || !session?.user) {
          await clearLocalUserData();
          dispatch({ type: 'reset', userId: LOCAL_USER_ID });
          return { error: null };
        }
        const { error } = await sb.functions.invoke('delete-account');
        if (error) return { error: error.message };
        await sb.auth.signOut();
        await clearLocalUserData();
        dispatch({ type: 'reset', userId: LOCAL_USER_ID });
        setSession(null);
        return { error: null };
      },
    }),
    [ready, recipes, recipeById, recipeSource, loadError, reloadRecipes, state, session],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp muss innerhalb von AppProvider verwendet werden');
  return ctx;
}
