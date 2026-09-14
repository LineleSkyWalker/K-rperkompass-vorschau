-- Migration 0002: Row Level Security
-- Grundsatz: Öffentliche Inhalte (Rezepte, Zutaten, Tags, BLS) sind lesbar,
-- Schreibzugriff nur für Admins. Nutzerdaten nur für den jeweiligen Nutzer.

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from user_profile where user_id = auth.uid()), false);
$$;

-- Öffentliche Referenzdaten -----------------------------------------------------
alter table bls_import_version enable row level security;
alter table bls_food enable row level security;
alter table ingredient enable row level security;
alter table tag enable row level security;
alter table recipe enable row level security;
alter table recipe_tag enable row level security;
alter table recipe_ingredient enable row level security;
alter table recipe_step enable row level security;
alter table recipe_nutrition enable row level security;

create policy "bls_version_read" on bls_import_version for select using (true);
create policy "bls_food_read" on bls_food for select using (true);
create policy "ingredient_read" on ingredient for select using (true);
create policy "tag_read" on tag for select using (active or is_admin());

-- Rezepte: veröffentlichte für alle, alle Stati für Admins
create policy "recipe_read_published" on recipe for select using (status = 'published' or is_admin());
create policy "recipe_tag_read" on recipe_tag for select using (
  exists (select 1 from recipe r where r.id = recipe_id and (r.status = 'published' or is_admin()))
);
create policy "recipe_ingredient_read" on recipe_ingredient for select using (
  exists (select 1 from recipe r where r.id = recipe_id and (r.status = 'published' or is_admin()))
);
create policy "recipe_step_read" on recipe_step for select using (
  exists (select 1 from recipe r where r.id = recipe_id and (r.status = 'published' or is_admin()))
);
create policy "recipe_nutrition_read" on recipe_nutrition for select using (
  exists (select 1 from recipe r where r.id = recipe_id and (r.status = 'published' or is_admin()))
);

-- Admin-Schreibrechte
create policy "bls_version_admin" on bls_import_version for all using (is_admin()) with check (is_admin());
create policy "bls_food_admin" on bls_food for all using (is_admin()) with check (is_admin());
create policy "ingredient_admin" on ingredient for all using (is_admin()) with check (is_admin());
create policy "tag_admin" on tag for all using (is_admin()) with check (is_admin());
create policy "recipe_admin" on recipe for all using (is_admin()) with check (is_admin());
create policy "recipe_tag_admin" on recipe_tag for all using (is_admin()) with check (is_admin());
create policy "recipe_ingredient_admin" on recipe_ingredient for all using (is_admin()) with check (is_admin());
create policy "recipe_step_admin" on recipe_step for all using (is_admin()) with check (is_admin());
create policy "recipe_nutrition_admin" on recipe_nutrition for all using (is_admin()) with check (is_admin());

-- Nutzerdaten -------------------------------------------------------------------
alter table user_profile enable row level security;
alter table favorite enable row level security;
alter table recipe_interaction enable row level security;
alter table meal_plan_entry enable row level security;
alter table shopping_list_item enable row level security;
alter table pantry_item enable row level security;
alter table analytics_event enable row level security;

create policy "profile_own" on user_profile for select using (user_id = auth.uid());
create policy "profile_own_update" on user_profile for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_admin() = (select is_admin from user_profile p where p.user_id = auth.uid()));
-- Hinweis: is_admin darf der Nutzer nicht selbst ändern (Check oben hält den alten Wert).

create policy "favorite_own" on favorite for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "interaction_own" on recipe_interaction for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "meal_plan_own" on meal_plan_entry for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "shopping_own" on shopping_list_item for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pantry_own" on pantry_item for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Analytics: nur einfügen (anonym), lesen nur Admins
create policy "analytics_insert" on analytics_event for insert with check (auth.role() in ('authenticated', 'anon'));
create policy "analytics_admin_read" on analytics_event for select using (is_admin());

grant execute on function delete_my_data() to authenticated;
grant execute on function is_admin() to authenticated, anon;
