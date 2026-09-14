import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, IconButton, Notice, Row, Screen, Text } from '@/design-system/components';
import { spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { addDays, formatDayShort, isToday, startOfWeek, toISODate, WEEKDAY_SHORT } from '@/lib/dates';
import { SERVING_OPTIONS } from '@/domain/servings';
import type { MealType } from '@/types/recipe';

const SLOTS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Frühstück' },
  { id: 'lunch', label: 'Mittagessen' },
  { id: 'dinner', label: 'Abendessen' },
  { id: 'snack', label: 'Snack' },
];

/** Modal: Rezept in den Wochenplan eintragen (Tag, Mahlzeit, Portionen). */
export default function AddToPlanScreen() {
  const params = useLocalSearchParams<{ recipeId: string; servings?: string; date?: string; slot?: MealType }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipeById, data, addToPlan } = useApp();
  const recipe = params.recipeId ? recipeById.get(params.recipeId) : undefined;

  const today = new Date();
  const weekStart = startOfWeek(today);
  const days = Array.from({ length: 14 }, (_, i) => toISODate(addDays(weekStart, i)));

  const [date, setDate] = useState<string>(params.date ?? toISODate(today));
  const [slot, setSlot] = useState<MealType>(params.slot ?? defaultSlot(recipe?.mealTypes ?? []));
  const [servings, setServings] = useState<number>(Number(params.servings) || recipe?.defaultServings || data.profile.defaultServings);
  const [eaten, setEaten] = useState<number | null>(null);

  if (!recipe) {
    return (
      <Screen style={{ paddingTop: insets.top, padding: spacing.xl }}>
        <Text variant="title">Rezept nicht gefunden</Text>
        <Button label="Schließen" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </Screen>
    );
  }

  const existingInSlot = data.planEntries.filter((e) => e.date === date && e.mealSlot === slot);
  const servingsEaten = eaten ?? servings;

  const save = () => {
    addToPlan({ recipeId: recipe.id, date, mealSlot: slot, servings, servingsEaten });
    router.back();
  };

  return (
    <Screen style={{ paddingTop: insets.top + spacing.sm }}>
      <Row style={styles.header}>
        <Text variant="h2" style={{ flex: 1 }} numberOfLines={1}>
          Zum Wochenplan
        </Text>
        <IconButton icon="close" accessibilityLabel="Schließen" onPress={() => router.back()} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingTop: 0, gap: spacing.xl }}>
        <Text variant="subtitle">{recipe.title}</Text>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Tag
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {days.map((d, i) => (
              <Chip
                key={d}
                label={`${WEEKDAY_SHORT[i % 7]} ${formatDayShort(d)}${isToday(d) ? ' · heute' : ''}`}
                selected={d === date}
                onPress={() => setDate(d)}
              />
            ))}
          </ScrollView>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Mahlzeit
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {SLOTS.map((s) => (
              <Chip key={s.id} label={s.label} selected={s.id === slot} onPress={() => setSlot(s.id)} />
            ))}
          </Row>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Portionen kochen
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {SERVING_OPTIONS.map((n) => (
              <Chip key={n} label={String(n)} selected={n === servings} onPress={() => { setServings(n); setEaten(null); }} />
            ))}
          </Row>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Davon an diesem Tag gegessen (Rest = Meal Prep)
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {Array.from({ length: servings }, (_, i) => i + 1).map((n) => (
              <Chip key={n} label={String(n)} small selected={n === servingsEaten} onPress={() => setEaten(n)} />
            ))}
          </Row>
          {servingsEaten < servings ? (
            <Text variant="caption" tone="muted" style={{ marginTop: spacing.sm }}>
              {servings - servingsEaten} {servings - servingsEaten === 1 ? 'Portion bleibt' : 'Portionen bleiben'} übrig – du kannst sie im Wochenplan als „Reste“ an einem anderen Tag eintragen.
            </Text>
          ) : null}
        </View>

        {existingInSlot.length ? (
          <Notice text={`Für diesen Slot ist schon etwas eingeplant (${existingInSlot.length}). Beide Einträge bleiben erhalten – du kannst im Wochenplan aufräumen.`} />
        ) : null}

        <Button label="Eintragen" icon="checkmark" onPress={save} />
      </ScrollView>
    </Screen>
  );
}

function defaultSlot(mealTypes: MealType[]): MealType {
  if (mealTypes.includes('dinner')) return 'dinner';
  if (mealTypes.includes('lunch')) return 'lunch';
  if (mealTypes.includes('breakfast')) return 'breakfast';
  return 'snack';
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, justifyContent: 'space-between' },
});
