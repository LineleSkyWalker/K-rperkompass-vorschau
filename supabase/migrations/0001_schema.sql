-- KÖRPER.KOMPASS – Rezept- & Meal-Planning-App
-- Migration 0001: Grundschema
-- Ausführen mit: supabase db push  (oder im SQL-Editor des Supabase-Dashboards)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack', 'dessert');
create type difficulty as enum ('easy', 'medium', 'advanced');
create type recipe_status as enum ('draft', 'review', 'published', 'archived');
create type source_type as enum ('koerperkompass', 'editorial', 'licensed_api', 'creative_commons', 'user');
create type image_source_type as enum ('own_photo', 'licensed_photo', 'generated', 'licensed_api', 'placeholder');
create type tag_category as enum ('meal_type', 'time', 'diet', 'experience', 'practical', 'nutrition', 'cuisine', 'dish_type');
create type mapping_status as enum ('unmapped', 'suggested', 'verified', 'rejected');
create type shopping_category as enum ('produce', 'bakery', 'dairy_chilled', 'meat_fish', 'dry_goods', 'canned', 'frozen', 'spices', 'other');

-- ---------------------------------------------------------------------------
-- BLS 4.0 – Nährwertdatenbank (Max Rubner-Institut, CC BY 4.0)
-- Nährwerte pro 100 g. NULL = kein verlässlicher Wert (≠ 0!).
-- Die 138 Nährstoffe liegen als JSONB {code: wert} in `nutrients`, damit das
-- Schema nicht 138 Spalten braucht; die App-relevanten Werte sind zusätzlich
-- als generierte Spalten indexierbar (siehe unten).
-- ---------------------------------------------------------------------------
create table bls_import_version (
  id            uuid primary key default gen_random_uuid(),
  source_name   text not null default 'Bundeslebensmittelschlüssel (BLS)',
  source_version text not null,               -- z. B. "4.0"
  source_file   text,                          -- Dateiname der importierten Excel
  source_doi    text,                          -- 10.25826/Data20251217-134202-0
  license       text not null default 'CC BY 4.0',
  attribution   text not null default 'Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0',
  imported_at   timestamptz not null default now(),
  row_count     integer
);

create table bls_food (
  bls_code       text primary key,             -- z. B. C131000
  name_de        text not null,
  name_en        text,
  main_group     char(1) generated always as (left(bls_code, 1)) stored,
  nutrients      jsonb not null default '{}'::jsonb,  -- {"ENERCC": 350, "FAPUN3": 0.05, ...}; fehlende Codes = kein Wert
  import_version_id uuid not null references bls_import_version(id) on delete cascade,
  created_at     timestamptz not null default now()
);
create index bls_food_name_de_trgm_idx on bls_food using gin (to_tsvector('german', name_de));
create index bls_food_main_group_idx on bls_food (main_group);

-- ---------------------------------------------------------------------------
-- ZUTATEN (standardisierte Lebensmittel)
-- ---------------------------------------------------------------------------
create table ingredient (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  canonical_name        text not null,
  plural_name           text,
  shopping_category     shopping_category not null default 'other',
  grams_per_piece       numeric(8,2),
  grams_per_tablespoon  numeric(8,2),
  grams_per_teaspoon    numeric(8,2),
  density_g_per_ml      numeric(6,3),
  allergens             text[] not null default '{}',
  nutrition_negligible  boolean not null default false,   -- Gewürz in Kleinstmenge ohne BLS-Eintrag: bei Nährwerten ignorieren
  bls_code              text references bls_food(bls_code) on delete set null,
  mapping_status        mapping_status not null default 'unmapped',
  mapping_note          text,
  mapping_reviewed_by   uuid,
  mapping_reviewed_at   timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index ingredient_mapping_status_idx on ingredient (mapping_status);

-- ---------------------------------------------------------------------------
-- TAGS
-- ---------------------------------------------------------------------------
create table tag (
  id          text primary key,                -- slug, z. B. 'comfort_food'
  label       text not null,
  category    tag_category not null,
  sort_order  integer not null default 0,
  active      boolean not null default true
);

-- ---------------------------------------------------------------------------
-- REZEPTE
-- ---------------------------------------------------------------------------
create table recipe (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  short_description   text not null default '',
  image_url           text,
  image_source_type   image_source_type,
  image_source_name   text,
  image_license       text,
  image_attribution   text,
  meal_types          meal_type[] not null default '{}',
  cuisine             text,
  prep_time_minutes   integer not null default 0 check (prep_time_minutes >= 0),
  cook_time_minutes   integer not null default 0 check (cook_time_minutes >= 0),
  total_time_minutes  integer generated always as (prep_time_minutes + cook_time_minutes) stored,
  difficulty          difficulty not null default 'easy',
  default_servings    integer not null default 2 check (default_servings > 0),
  allergens           text[] not null default '{}',
  keeps_days          integer,
  freezable           boolean not null default false,
  source_type         source_type not null default 'koerperkompass',
  source_name         text,
  source_url          text,
  source_license      text,
  source_author       text,
  imported_at         timestamptz,
  status              recipe_status not null default 'draft',
  created_by          uuid,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index recipe_status_idx on recipe (status);
create index recipe_meal_types_idx on recipe using gin (meal_types);

create table recipe_tag (
  recipe_id uuid not null references recipe(id) on delete cascade,
  tag_id    text not null references tag(id) on delete cascade,
  primary key (recipe_id, tag_id)
);

create table recipe_ingredient (
  id                 uuid primary key default gen_random_uuid(),
  recipe_id          uuid not null references recipe(id) on delete cascade,
  ingredient_id      uuid not null references ingredient(id) on delete restrict,
  quantity           numeric(10,3),             -- NULL = nach Geschmack
  unit               text,                      -- g, kg, ml, l, TL, EL, Stück, ...
  quantity_in_grams  numeric(10,3),             -- bei default_servings; NULL = nicht umrechenbar
  optional           boolean not null default false,
  preparation_note   text,
  ingredient_group   text,
  sort_order         integer not null default 0
);
create index recipe_ingredient_recipe_idx on recipe_ingredient (recipe_id);
create index recipe_ingredient_ingredient_idx on recipe_ingredient (ingredient_id);

create table recipe_step (
  id                uuid primary key default gen_random_uuid(),
  recipe_id         uuid not null references recipe(id) on delete cascade,
  step_number       integer not null,
  text              text not null,
  duration_minutes  integer,
  unique (recipe_id, step_number)
);

-- Berechnete Nährwerte pro Rezept (Cache; wird per Skript/Trigger neu berechnet)
create table recipe_nutrition (
  recipe_id            uuid primary key references recipe(id) on delete cascade,
  per_serving          jsonb not null default '{}'::jsonb,   -- {"ENERCC": 412.3, ...}
  missing_grams        jsonb not null default '{}'::jsonb,   -- {"FAPUN3": 120, ...}
  total_grams          numeric(10,2) not null default 0,
  unmapped_ingredients integer not null default 0,
  data_quality         text not null default 'unavailable',  -- bls_calculated | incomplete | development_placeholder | unavailable
  bls_version_id       uuid references bls_import_version(id),
  calculated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- NUTZERDATEN
-- ---------------------------------------------------------------------------
create table user_profile (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  display_name            text,
  dietary_preferences     text[] not null default '{}',   -- 'vegetarian' | 'vegan'
  allergens               text[] not null default '{}',
  intolerances            text[] not null default '{}',
  family_friendly         boolean not null default false,
  preferred_max_cook_time integer,
  default_servings        integer not null default 2 check (default_servings > 0),
  show_nutrition          boolean not null default true,
  show_reference_values   boolean not null default false,
  notifications_enabled   boolean not null default false,
  onboarding_completed    boolean not null default false,
  is_admin                boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table favorite (
  user_id    uuid not null references auth.users(id) on delete cascade,
  recipe_id  uuid not null references recipe(id) on delete cascade,
  created_at timestamptz not null default now(),
  cooked_count integer not null default 0,
  primary key (user_id, recipe_id)
);

-- Swipe-Signale für das Ranking (Like/Skip/Seen)
create table recipe_interaction (
  user_id    uuid not null references auth.users(id) on delete cascade,
  recipe_id  uuid not null references recipe(id) on delete cascade,
  action     text not null check (action in ('seen', 'like', 'skip')),
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id, action)
);

create table meal_plan_entry (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  date                 date not null,
  meal_slot            meal_type not null,
  recipe_id            uuid not null references recipe(id) on delete cascade,
  servings             integer not null check (servings > 0),
  servings_eaten       integer not null check (servings_eaten >= 0),
  leftover_of_entry_id uuid references meal_plan_entry(id) on delete set null,
  notes                text,
  created_at           timestamptz not null default now()
);
create index meal_plan_entry_user_date_idx on meal_plan_entry (user_id, date);

create table shopping_list_item (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  ingredient_id      uuid references ingredient(id) on delete set null,
  name               text not null,
  quantity           numeric(10,3),
  unit               text,
  quantity_in_grams  numeric(10,3),
  category           shopping_category not null default 'other',
  checked            boolean not null default false,
  already_have       boolean not null default false,
  from_recipe_ids    uuid[] not null default '{}',
  manual             boolean not null default false,
  updated_at         timestamptz not null default now()
);
create index shopping_list_item_user_idx on shopping_list_item (user_id);

-- Vorräte ("Habe ich bereits") – zutatbezogen, damit sie über Listen hinweg gelten
create table pantry_item (
  user_id       uuid not null references auth.users(id) on delete cascade,
  ingredient_id uuid not null references ingredient(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, ingredient_id)
);

-- Datenschutzfreundliche Produktmetriken: KEINE user_id, nur anonymer Sitzungs-Hash
create table analytics_event (
  id          bigint generated always as identity primary key,
  event_type  text not null,
  recipe_id   uuid,
  meta        jsonb not null default '{}'::jsonb,
  session_hash text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at Trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger recipe_updated_at before update on recipe for each row execute function set_updated_at();
create trigger ingredient_updated_at before update on ingredient for each row execute function set_updated_at();
create trigger user_profile_updated_at before update on user_profile for each row execute function set_updated_at();
create trigger shopping_list_item_updated_at before update on shopping_list_item for each row execute function set_updated_at();

-- Profil automatisch anlegen, wenn ein Auth-User entsteht
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profile (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Account-/Datenlöschung (DSGVO): Nutzer kann alle eigenen Daten löschen.
-- Das Löschen des Auth-Users selbst geschieht per Edge Function mit Service Role
-- (siehe supabase/functions/delete-account), Kaskaden räumen alles Weitere auf.
-- ---------------------------------------------------------------------------
create or replace function delete_my_data() returns void language plpgsql security definer set search_path = public as $$
begin
  delete from favorite where user_id = auth.uid();
  delete from recipe_interaction where user_id = auth.uid();
  delete from meal_plan_entry where user_id = auth.uid();
  delete from shopping_list_item where user_id = auth.uid();
  delete from pantry_item where user_id = auth.uid();
  update user_profile set dietary_preferences = '{}', allergens = '{}', intolerances = '{}', display_name = null, onboarding_completed = false where user_id = auth.uid();
end $$;
