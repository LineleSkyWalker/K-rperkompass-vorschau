import type { NutrientValues } from './nutrition';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export type Difficulty = 'easy' | 'medium' | 'advanced';

export type RecipeStatus = 'draft' | 'review' | 'published' | 'archived';

export type SourceType = 'koerperkompass' | 'editorial' | 'licensed_api' | 'creative_commons' | 'user';

export type ImageSourceType = 'own_photo' | 'licensed_photo' | 'generated' | 'licensed_api' | 'placeholder';

/** Tag-Kategorien – bewusst neutral, nie moralisierend (siehe Markenregeln). */
export type TagCategory = 'meal_type' | 'time' | 'diet' | 'experience' | 'practical' | 'nutrition' | 'cuisine' | 'dish_type';

export interface Tag {
  id: string; // slug, z. B. "comfort_food"
  label: string; // Anzeigename, z. B. "Comfort Food"
  category: TagCategory;
  sortOrder: number;
  active: boolean;
}

export type Allergen =
  | 'gluten'
  | 'crustaceans'
  | 'egg'
  | 'fish'
  | 'peanut'
  | 'soy'
  | 'milk'
  | 'nuts'
  | 'celery'
  | 'mustard'
  | 'sesame'
  | 'sulphites'
  | 'lupin'
  | 'molluscs';

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  gluten: 'Gluten',
  crustaceans: 'Krebstiere',
  egg: 'Ei',
  fish: 'Fisch',
  peanut: 'Erdnüsse',
  soy: 'Soja',
  milk: 'Milch / Laktose',
  nuts: 'Schalenfrüchte (Nüsse)',
  celery: 'Sellerie',
  mustard: 'Senf',
  sesame: 'Sesam',
  sulphites: 'Sulfite',
  lupin: 'Lupinen',
  molluscs: 'Weichtiere',
};

/** Einkaufslisten-Kategorien */
export type ShoppingCategory =
  | 'produce'
  | 'bakery'
  | 'dairy_chilled'
  | 'meat_fish'
  | 'dry_goods'
  | 'canned'
  | 'frozen'
  | 'spices'
  | 'other';

export const SHOPPING_CATEGORY_LABELS: Record<ShoppingCategory, string> = {
  produce: 'Obst & Gemüse',
  bakery: 'Brot & Backwaren',
  dairy_chilled: 'Kühlregal',
  meat_fish: 'Fleisch & Fisch',
  dry_goods: 'Trockenwaren',
  canned: 'Konserven',
  frozen: 'Tiefkühl',
  spices: 'Gewürze & Öle',
  other: 'Sonstiges',
};

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  'produce',
  'bakery',
  'dairy_chilled',
  'meat_fish',
  'dry_goods',
  'canned',
  'frozen',
  'spices',
  'other',
];

/** Erlaubte Mengeneinheiten in Rezepten */
export type Unit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'TL'
  | 'EL'
  | 'Stück'
  | 'Prise'
  | 'Bund'
  | 'Zehe'
  | 'Scheibe'
  | 'Dose'
  | 'Packung'
  | 'Tasse';

export type MappingStatus = 'unmapped' | 'suggested' | 'verified' | 'rejected';

/**
 * Standardisiertes Lebensmittel (Zutat), idealerweise auf einen BLS-Eintrag gemappt.
 */
export interface Ingredient {
  id: string;
  canonicalName: string; // z. B. "Tomate, frisch"
  pluralName?: string;
  shoppingCategory: ShoppingCategory;
  /** Gramm pro Stück / Einheit für die Umrechnung (z. B. 1 Ei ≈ 55 g) */
  gramsPerPiece?: number;
  /** Gramm pro EL / TL, falls abweichend vom Standard (Öl ≈ 10 g/EL, Mehl ≈ 10 g/EL) */
  gramsPerTablespoon?: number;
  gramsPerTeaspoon?: number;
  /** Dichte in g/ml für Flüssigkeiten (Wasser 1.0, Öl ≈ 0.92, Sahne ≈ 1.0) */
  densityGPerMl?: number;
  blsCode: string | null;
  mappingStatus: MappingStatus;
  mappingNote?: string;
  allergens: Allergen[];
  /** Nährwerte pro 100 g – nur gefüllt, wenn BLS-Zuordnung verifiziert oder vorgeschlagen und BLS importiert */
  nutritionPer100g?: NutrientValues;
  /** Gewürz in Kleinstmenge ohne BLS-Eintrag – wird bei Nährwerten ignoriert, ohne Warnung */
  nutritionNegligible?: boolean;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number | null; // null = "nach Geschmack"
  unit: Unit | null;
  /** Für Nährwert & Einkaufsliste: die Menge in Gramm bei default_servings */
  quantityInGrams: number | null;
  /** Anzeigetext, z. B. "1 Bund Basilikum" – wird bei Portionsänderung neu erzeugt */
  displayText?: string;
  optional: boolean;
  preparationNote?: string; // "fein gewürfelt"
  /** Gruppe innerhalb des Rezepts, z. B. "Für das Dressing" */
  group?: string;
  sortOrder: number;
}

export interface RecipeStep {
  id: string;
  stepNumber: number;
  text: string;
  durationMinutes?: number;
}

export interface RecipeImage {
  url: string;
  sourceType: ImageSourceType;
  sourceName?: string;
  license?: string;
  /** Urheber-Nennung, z. B. „Foto: Jane Doe“ */
  attribution?: string;
  /** Link zur Quellseite (Lizenz-/Urhebernachweis) */
  sourceUrl?: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  image: RecipeImage | null;
  mealTypes: MealType[];
  cuisine?: string;
  tags: string[]; // Tag-IDs
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  difficulty: Difficulty;
  defaultServings: number;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  allergens: Allergen[];
  /** Für Resteverwertung / Meal Prep: wie viele Tage hält sich das Gericht im Kühlschrank */
  keepsDays?: number;
  /** Kann eingefroren werden */
  freezable?: boolean;
  sourceType: SourceType;
  sourceName?: string;
  sourceUrl?: string;
  sourceLicense?: string;
  sourceAuthor?: string;
  importedAt?: string;
  status: RecipeStatus;
  createdAt: string;
  updatedAt: string;
}

/** Ein Slot im Wochenplan. */
export interface MealPlanEntry {
  id: string;
  userId: string;
  /** ISO-Datum des Tages (YYYY-MM-DD) */
  date: string;
  mealSlot: MealType;
  recipeId: string;
  recipe?: Recipe;
  /** Portionen, die für diesen Eintrag gekocht werden */
  servings: number;
  /**
   * Portionen, die an diesem Slot tatsächlich gegessen werden.
   * Differenz zu `servings` = Reste (Meal Prep). Standard: = servings.
   */
  servingsEaten: number;
  /** Verweis auf einen anderen Eintrag, dessen Reste hier gegessen werden. */
  leftoverOfEntryId?: string | null;
  notes?: string;
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  userId: string;
  ingredientId: string | null; // null bei manuell hinzugefügten Freitext-Produkten
  name: string;
  quantity: number | null;
  unit: string | null;
  quantityInGrams: number | null;
  category: ShoppingCategory;
  checked: boolean;
  /** true = Nutzer hat es bereits im Vorrat → aus der Liste ausblenden */
  alreadyHave: boolean;
  /** Rezept-IDs, aus denen der Eintrag stammt */
  fromRecipeIds: string[];
  manual: boolean;
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  dietaryPreferences: ('vegetarian' | 'vegan')[];
  allergens: Allergen[];
  intolerances: string[];
  familyFriendly: boolean;
  preferredMaxCookTime: number | null;
  defaultServings: number;
  showNutrition: boolean;
  /** DGE-Referenzwerte als dezente Orientierung anzeigen (Standard: aus) */
  showReferenceValues: boolean;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  /** Einwilligung in anonyme Nutzungsstatistik (Opt-in, Standard: aus) */
  analyticsConsent: boolean;
  /** Version der Nutzungshinweise/Datenschutzerklärung, die bestätigt wurde */
  legalAcceptedVersion: string | null;
}

export type SwipeAction = 'like' | 'skip';

export type AnalyticsEvent =
  | { type: 'recipe_viewed'; recipeId: string }
  | { type: 'swipe_like'; recipeId: string }
  | { type: 'swipe_dislike'; recipeId: string }
  | { type: 'favorite_added'; recipeId: string }
  | { type: 'favorite_removed'; recipeId: string }
  | { type: 'recipe_added_to_planner'; recipeId: string; mealSlot: MealType }
  | { type: 'shopping_list_generated'; itemCount: number }
  | { type: 'filter_used'; filterId: string }
  | { type: 'mood_filter_used'; mood: string };
