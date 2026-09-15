# KÖRPER.KOMPASS – Rezept- & Meal-Planning-App

> Verstehen. Fühlen. Verändern.

Mobile App (iOS/Android, Web-fähig), die bei der Frage hilft: „Was möchte ich heute oder diese Woche essen?“ – Swipe-Inspiration, Favoriten, Wochenplan, automatische Einkaufsliste und Nährwertinformationen aus dem Bundeslebensmittelschlüssel (BLS 4.0). Keine Diät-App: keine Kalorienziele, keine Bewertung von Lebensmitteln.

Architektur, Datenfluss und Entscheidungen: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Schnellstart (lokaler Modus, ohne Server)

```bash
npm install
npm start          # Expo Dev Server – QR-Code mit Expo Go scannen
npm run web        # oder im Browser
```

Ohne konfiguriertes Supabase läuft die App komplett lokal: 64 Rezepte, Favoriten, Wochenplan und Einkaufsliste werden auf dem Gerät gespeichert. Nährwerte erscheinen, sobald die BLS-Zuordnung erzeugt wurde (siehe unten).

## Umgebungsvariablen

`.env.example` nach `.env` kopieren.

| Variable | Wo | Zweck |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | App | Supabase-Projekt-URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | App | öffentlicher Anon-Key (Sicherheit über RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | nur Skripte | Import/Seed – **niemals** in die App bundeln |
| `BLS_XLSX_PATH` | Skripte | Pfad zur BLS-Excel-Datei |

## Supabase-Setup

1. Projekt anlegen (Region EU empfohlen).
2. Migrationen ausführen – entweder `supabase db push` (CLI) oder die Dateien `supabase/migrations/0001_schema.sql` und `0002_rls.sql` nacheinander im SQL-Editor.
3. Auth: E-Mail-Login mit Magic Link aktivieren (Provider „Email“, Passwort optional).
4. Ersten Admin setzen: `update user_profile set is_admin = true where user_id = '<uuid>';`
5. Edge Function für Konto-Löschung: `supabase functions deploy delete-account`.

## BLS-Import (Nährwerte)

Quelle: Max Rubner-Institut (2025), Bundeslebensmittelschlüssel (BLS) 4.0, CC BY 4.0, DOI 10.25826/Data20251217-134202-0. Download: https://blsdb.de/download (ZIP entpacken → `BLS_4_0_Daten_2025_DE.xlsx`).

```bash
# 1) Datei ablegen (nicht versioniert)
cp ~/Downloads/BLS_4_0_Daten_2025_DE.xlsx data/bls/

# 2) Lokalen Cache erzeugen (und optional in Supabase importieren)
npm run bls:import -- --local-only     # nur Cache data/bls/bls-4.0.json
npm run bls:import                     # zusätzlich Tabelle bls_food (braucht Service-Role-Key)

# 3) Zutaten den BLS-Einträgen zuordnen (Vorschläge, nie geraten)
npm run recipes:map
#    → data/ingredient-mapping.json  (Status suggested/unmapped; hier prüfen und auf "verified" setzen)
#    → data/bls/ingredient-nutrition.json (Nährwerte für den lokalen Modus)
```

Zutaten mit Status `unmapped` werden im Report gelistet („Mapping erforderlich“) und fließen nicht in Nährwerte ein. Fehlende BLS-Werte werden nie als 0 interpretiert; die App zeigt Unvollständigkeit an.

## Rezepte

Rezepte liegen als TypeScript in `data/recipes/` (kompakte Autoren-DSL, siehe `_dsl.ts`), der Zutatenkatalog in `data/ingredients.ts`.

```bash
npm run recipes:validate   # prüft Zutaten, Tags, Slugs, Gramm-Umrechnung, Verteilung
npm run recipes:seed       # schreibt Tags, Zutaten, Rezepte + Nährwert-Cache nach Supabase
```

Bilder: Alle Rezepte nutzen aktuell einen markenkonformen Platzhalter. Bilder werden über `image_url` + Quelle/Lizenz in der Datenbank gepflegt (eigene Fotos, lizenzierte Fotos, generierte Bilder).

## Tests, Typecheck, Lint

```bash
npm test            # Jest: Portionen, Einheiten, Zusammenführung, Einkaufsliste, Nährwerte, Omega-3/6, Ranking, Filter, BLS-Parser
npm run typecheck   # TypeScript strict
npm run lint        # ESLint (eslint-config-expo)
```

## Deployment

- Entwicklung: Expo Go (`npm start`).
- Builds: EAS Build (`npx eas build --platform ios|android`), vorher `eas.json` anlegen und Bundle-IDs in `app.json` prüfen (`de.koerperkompass.app`).
- Web: `npx expo export --platform web` erzeugt ein statisches Bundle in `dist/`.
- Umgebungsvariablen in EAS als Secrets hinterlegen (`EXPO_PUBLIC_*`).

## Adminbereich (MVP)

Im MVP dient das Supabase-Dashboard als Admin: Rezepte/Zutaten/Tags bearbeiten, `ingredient.mapping_status` auf `verified` setzen, Rezepte über `status` deaktivieren. Nährwerte neu berechnen: `npm run recipes:seed`. Das Schema (Rollen über `user_profile.is_admin`, RLS-Policies) ist für eine eigene Admin-Oberfläche vorbereitet.

## Lizenz- und Attributionshinweise

- Nährwertdaten: Max Rubner-Institut, Bundeslebensmittelschlüssel (BLS) 4.0, CC BY 4.0. Die Attribution wird in der App (Profil → „Über die Daten“) und im Nährwertpanel angezeigt.
- Schriften: Bebas Neue, DM Sans (SIL Open Font License).
- Rezepte: eigene KÖRPER.KOMPASS-Inhalte (`source_type = koerperkompass`).

## Rezeptfotos & Rechtstexte

- Fotos stammen von Wikimedia Commons (CC0 / CC BY / CC BY-SA / gemeinfrei). Auswahl in `scripts/image-picks.json`,
  erzeugte Zuordnung in `data/recipe-images.ts` (`npx tsx scripts/build-recipe-images.ts`). Urheber + Lizenz werden auf
  der Rezeptseite und unter Profil → Bildnachweise angezeigt. Für den Store-Release empfiehlt sich, die Fotos in Supabase
  Storage (EU) zu kopieren, damit keine Anfragen an Wikimedia-Server gehen.
- Impressum, Datenschutzerklärung und Nutzungshinweise liegen in `src/data/legal.ts` (Inhaberdaten dort pflegen).
  Vor dem Release bitte anwaltlich gegenlesen lassen.
