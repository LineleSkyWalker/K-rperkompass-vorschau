import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Button, EmptyState, IconButton, LoadingState, Row, Screen, Text } from '@/design-system/components';
import { colors, semantic, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { applyFilter, EMPTY_FILTER, isFilterActive, type RecipeFilter } from '@/domain/filters';
import { rankRecipes } from '@/domain/ranking';
import { SwipeDeck, type SwipeDeckHandle } from '@/components/SwipeDeck';
import { FilterBar, ActiveFilterSummary } from '@/components/FilterBar';
import { MoodSheet } from '@/components/MoodSheet';
import { track } from '@/lib/analytics';
import type { Recipe } from '@/types/recipe';

export default function DiscoverScreen() {
  const { ready, recipes, data, swipe, markSeen, loadError, reloadRecipes } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const deckRef = useRef<SwipeDeckHandle>(null);
  const [filter, setFilter] = useState<RecipeFilter>(EMPTY_FILTER);
  const [moodOpen, setMoodOpen] = useState(false);
  const [deckKey, setDeckKey] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const [current, setCurrent] = useState<Recipe | undefined>(undefined);

  const signals = useMemo(
    () => ({
      liked: new Set(data.liked),
      disliked: new Set(data.disliked),
      favorites: new Set(data.favorites),
      planned: new Set(data.planned),
      seen: new Set(data.seen),
    }),
    [data.liked, data.disliked, data.favorites, data.planned, data.seen],
  );

  // Stapel wird nur neu berechnet, wenn Filter oder Rezepte sich ändern (nicht bei jedem Swipe)
  const deck = useMemo(() => {
    const filtered = applyFilter(recipes, filter, data.profile);
    return rankRecipes(filtered, signals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes, filter, deckKey, data.profile]);

  const changeFilter = useCallback((f: RecipeFilter) => {
    setFilter(f);
    setDeckKey((k) => k + 1);
    setExhausted(false);
    for (const t of f.tags) track({ type: 'filter_used', filterId: t });
    for (const m of f.moods) track({ type: 'mood_filter_used', mood: m });
  }, []);

  const onSwipe = useCallback(
    (recipe: Recipe, direction: 'left' | 'right') => {
      swipe(recipe.id, direction === 'right' ? 'like' : 'skip');
      Haptics.impactAsync(direction === 'right' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },
    [swipe],
  );

  const onCurrentChange = useCallback((r: Recipe | undefined) => {
    setCurrent(r);
    if (!r) setExhausted(true);
  }, []);

  const onTap = useCallback(
    (recipe: Recipe) => {
      markSeen(recipe.id);
      track({ type: 'recipe_viewed', recipeId: recipe.id });
      router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } });
    },
    [markSeen, router],
  );

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text variant="h1">Entdecken</Text>
        <Text variant="bodySmall" tone="secondary">
          Was könnte heute zu dir passen?
        </Text>
      </View>

      <FilterBar filter={filter} onChange={changeFilter} onOpenMood={() => setMoodOpen(true)} />
      <ActiveFilterSummary filter={filter} onClear={() => changeFilter(EMPTY_FILTER)} />

      <View style={styles.deckArea}>
        {!ready ? (
          <LoadingState label="Rezepte werden geladen …" />
        ) : loadError ? (
          <EmptyState
            icon="cloud-offline-outline"
            title="Rezepte gerade nicht erreichbar"
            text="Vielleicht fehlt die Internetverbindung. Versuch es gleich noch einmal."
            action={<Button label="Erneut laden" onPress={reloadRecipes} />}
          />
        ) : deck.length === 0 || exhausted ? (
          <EmptyState
            icon={isFilterActive(filter) ? 'options-outline' : 'sparkles-outline'}
            title={isFilterActive(filter) ? 'Dazu passt gerade nichts' : 'Du hast alles gesehen'}
            text={
              isFilterActive(filter)
                ? 'Mit weniger Filtern findest du wieder mehr Ideen.'
                : 'Bereits angesehene Rezepte kommen wieder – oder du stöberst in deinen Favoriten.'
            }
            action={
              isFilterActive(filter) ? (
                <Button label="Filter zurücksetzen" onPress={() => changeFilter(EMPTY_FILTER)} />
              ) : (
                <Button label="Nochmal von vorn" onPress={() => { setDeckKey((k) => k + 1); setExhausted(false); }} />
              )
            }
          />
        ) : (
          <SwipeDeck key={deckKey} ref={deckRef} recipes={deck} onSwipe={onSwipe} onTap={onTap} onCurrentChange={onCurrentChange} />
        )}
      </View>

      {ready && deck.length > 0 && !exhausted ? (
        <Row style={[styles.actions, { paddingBottom: spacing.md }]} gap={spacing.lg}>
          <IconButton icon="arrow-forward" accessibilityLabel="Weiter" size={56} background={colors.neutral.beige} onPress={() => deckRef.current?.swipe('left')} />
          <IconButton
            icon="book-outline"
            accessibilityLabel="Rezept ansehen"
            size={56}
            onPress={() => current && onTap(current)}
          />
          <IconButton
            icon="calendar-outline"
            accessibilityLabel="Zum Wochenplan hinzufügen"
            size={56}
            onPress={() => current && router.push({ pathname: '/add-to-plan', params: { recipeId: current.id } })}
          />
          <IconButton icon="heart" accessibilityLabel="Favorit" size={56} color={semantic.textOnAccent} background={colors.brand.turquoise} onPress={() => deckRef.current?.swipe('right')} />
        </Row>
      ) : null}

      <MoodSheet visible={moodOpen} selected={filter.moods} onChange={(moods) => changeFilter({ ...filter, moods })} onClose={() => setMoodOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
  deckArea: { flex: 1, marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.md },
  actions: { justifyContent: 'center', paddingHorizontal: spacing.lg },
});
