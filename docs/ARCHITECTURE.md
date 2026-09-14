# KÖRPER.KOMPASS – Architekturübersicht

Stand: Phase 1 (MVP-Grundgerüst), September 2026

## 1. Produktkern in einem Satz

Eine ruhige Rezept- und Wochenplan-App, die Menschen bei der Frage „Was möchte ich heute oder diese Woche essen?“ hilft – mit Swipe-Inspiration, Favoriten, Wochenplan, automatischer Einkaufsliste und Nährwertinformationen aus dem Bundeslebensmittelschlüssel (BLS 4.0). Ausdrücklich keine Diät-App: keine Kalorienziele, keine Ampeln, keine Moral bei Lebensmitteln.

## 2. Technischer Stack

| Bereich | Entscheidung | Begründung |
|---|---|---|
| App | Expo SDK 57, React Native 0.86, TypeScript strict, Expo Router | Cross-Platform iOS/Android, Web als Bonus (`expo export --platform web` läuft bereits), dateibasiertes Routing |
| Gesten/Animation | react-native-gesture-handler + Reanimated 4 | Stabile Standardbibliotheken; eigene, schlichte Swipe-Implementierung (kein Tinder-Klon) |
| Backend | Supabase (PostgreSQL, Auth, RLS, Edge Functions) | Relationales Modell, Row Level Security, EU-Hosting wählbar |
| Lokaler Modus | AsyncStorage + Seed-Rezepte | Die App läuft **ohne Server** vollständig (Favoriten, Wochenplan, Einkaufsliste); Supabase ergänzt Sync + Konto |
| Nährwerte | BLS 4.0 (Max Rubner-Institut, CC BY 4.0), importiert in eigene Tabelle | Keine externen Anfragen zur Laufzeit; Attribution und Version gespeichert |
| Tests | Jest (jest-expo) | Reine Businesslogik ist ohne UI testbar |
| Schriften | Bebas Neue (Titel), DM Sans (Text) | Markenvorgabe (Avenir-Ersatz) |

Bewusst **nicht** verwendet: State-Management-Bibliotheken (React Context + Reducer reicht), ORM, Tracking-SDKs.

## 3. Ordnerstruktur

```
app/                      Expo-Router-Screens
  (tabs)/                 index (Entdecken), favoriten, wochenplan, einkaufsliste, profil
  recipe/[id].tsx         Rezeptdetail
  add-to-plan.tsx         Modal: in den Wochenplan eintragen
  onboarding.tsx          Erststart (ohne Gewicht/BMI/Kalorienziel)
src/
  design-system/          tokens.ts (Farben, Typo, Spacing), components.tsx (Text, Button, Chip, EmptyState …)
  domain/                 reine Businesslogik (units, servings, nutrition, shoppingList, filters, ranking) + __tests__
  types/                  Datenmodell (recipe.ts, nutrition.ts)
  data/                   tags, referenceValues, recipeSource (lokal/Supabase), userData (Persistenz/Sync), supabaseMappers
  state/                  AppProvider (Context + Reducer, Persistenz, Auth)
  components/             RecipeCard, SwipeDeck, FilterBar, MoodSheet, NutritionPanel, RecipeImage
  lib/                    supabase-Client, storage, dates, ids, analytics
data/
  ingredients.ts          Zutatenkatalog (195 Einträge, Stück-/Löffelgewichte, Allergene, BLS-Suchhinweis)
  recipes/                64 KÖRPER.KOMPASS-Rezepte in kompakter Autoren-DSL (_dsl.ts baut das Datenmodell)
  ingredient-mapping.json Zuordnung Zutat → BLS-Code mit Status (wird generiert, dann gepflegt)
  bls/                    BLS-Rohdaten (nicht versioniert) + generierte App-Nährwertdatei
scripts/                  import-bls, suggest-bls-mapping, validate-recipes, seed-recipes
supabase/migrations/      0001_schema.sql, 0002_rls.sql
supabase/functions/       delete-account (Konto-Löschung, DSGVO)
docs/                     diese Datei
```

## 4. Datenfluss

```
BLS 4.0 (xlsx) ──import-bls──▶ data/bls/bls-4.0.json ──┐
                                   └──▶ Supabase bls_food │
data/ingredients.ts ──suggest-bls-mapping──▶ data/ingredient-mapping.json (suggested/verified/unmapped)
                                            └──▶ data/bls/ingredient-nutrition.json (für lokalen Modus)
data/recipes/*.ts ──validate-recipes──▶ ok ──seed-recipes──▶ Supabase recipe/recipe_ingredient/…/recipe_nutrition
```

Zur Laufzeit lädt `recipeSource.ts` Rezepte entweder aus Supabase (mit `bls_food.nutrients` per Join) oder aus dem Seed + `ingredient-nutrition.json`. Die Nährwertberechnung (`domain/nutrition.ts`) ist in beiden Fällen dieselbe reine Funktion.

## 5. Nährwert-Pipeline im Detail

1. **Jede Zutat** hat Gramm-Umrechnungsregeln (`toGrams`): g/kg/ml/l direkt, EL/TL zutatenspezifisch, Stück nur mit bekanntem Stückgewicht – sonst `null` (es wird nie geraten).
2. **Mapping** auf einen BLS-Code trägt einen Status: `unmapped` → `suggested` (Skript) → `verified` (Mensch im Admin) oder `rejected`. Nährwerte fließen nur bei `suggested`/`verified` ein; in der App ist `suggested` sichtbar, weil der Vorschlag prüfbar ist – die Doku empfiehlt Freigabe vor Launch.
3. **Summierung** pro Rezept, Portion, Wochenplan-Eintrag (nur *gegessene* Portionen), Tag und Woche. Fehlende BLS-Werte (`null`) werden **nicht** als 0 gezählt, sondern als „fehlende Gramm“ protokolliert → `coverage()` und `dataQuality()` steuern die ehrliche Anzeige (Punkt türkis = vollständig, apricot = unvollständig).
4. **Omega-3/6**: `FAPUN3`, `FAPUN6` plus ALA, EPA, DHA, Linolsäure, Arachidonsäure; das Verhältnis wird als „Omega-6 : Omega-3 = x : 1“ gezeigt und als unvollständig markiert, wenn Fettsäurewerte fehlen.
5. **Referenzwerte** (DGE) sind vorbereitet, aber bewusst **leer und deaktiviert**, bis sie fachlich geprüft mit Quelle hinterlegt werden (`REFERENCE_VALUES_VERIFIED = false`).

## 6. Datenschutz und Sicherheit

- Keine Erfassung von Gewicht, BMI, Wunschgewicht, Kalorienziel.
- Supabase-Anon-Key darf im Client liegen; Schutz durch RLS (`0002_rls.sql`): Referenzdaten lesbar, Nutzerdaten nur für den Nutzer, Schreibrechte auf Inhalte nur für `is_admin`.
- Service-Role-Key nur in Skripten/Edge Functions (`.env`, nie gebundelt).
- Analytics: nur Ereignistyp, Rezept-ID, anonymer Sitzungs-Hash. Keine User-ID.
- „Alle Daten löschen“ (RPC `delete_my_data`) und „Konto löschen“ (Edge Function) sind im Profil.

## 7. MVP-Scope (Version 1)

Umgesetzt: Rezeptdatenbank (64 Rezepte), Swipe-Karten, Filter inkl. „Wonach ist mir?“, Rezeptdetail mit Portionsumrechnung, Favoriten mit Filtern, Wochenplan Mo–So mit 4 Slots, Portionen kochen/essen (Meal-Prep-Reste), automatische Einkaufsliste mit Zusammenführung, Abhaken, „Habe ich bereits“ (Vorrat), eigene Produkte, Nährwerte pro Portion/Tag/Woche mit Vollständigkeitsstatus, Onboarding, Profil, Datenlöschung, Empty States, lokale Persistenz + optionaler Supabase-Sync, Magic-Link-Login.

Offen für Launch: BLS-Datei importieren und Zuordnungen prüfen (Admin), Bilder (eigene/lizenzierte), Adminoberfläche (MVP: Supabase-Dashboard + `ingredient-mapping.json`), Referenzwerte, Push-Benachrichtigungen, Store-Builds (EAS).

## 8. Ranking (transparent)

Tags von Favoriten (×2) und geplanten Rezepten (×3) und Likes (×1) bilden Gewichte; Dislikes ziehen ab. Jeder vierte Platz im Stapel ist ein „Entdeckungs-Slot“ für ein Rezept, das nicht zu den Vorlieben passt – gegen die Filterblase. Gesehene Rezepte rutschen nach hinten, Favoriten/Dislikes raus.
