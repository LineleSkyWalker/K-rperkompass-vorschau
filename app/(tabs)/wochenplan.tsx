import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, Divider, EmptyState, IconButton, Row, Screen, Text } from '@/design-system/components';
import { colors, radius, semantic, shadows, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { addDays, formatDayShort, isToday, startOfWeek, weekDates, WEEKDAY_LABELS } from '@/lib/dates';
import { dayTotals, entryTotals, formatNutrient, weekTotals } from '@/domain/nutrition';
import { NutritionPanel } from '@/components/NutritionPanel';
import { BrandHeader } from '@/components/BrandHeader';
import { SERVING_OPTIONS } from '@/domain/servings';
import type { MealPlanEntry, MealType } from '@/types/recipe';

const SLOTS: { id: MealType; label: string }[] = [
  { id: 'breakfast', label: 'Frühstück' },
  { id: 'lunch', label: 'Mittagessen' },
  { id: 'dinner', label: 'Abendessen' },
  { id: 'snack', label: 'Snack' },
];

export default function PlannerScreen() {
  const { data, recipeById, updatePlanEntry, removePlanEntry, clearWeek, addToPlan, regenerateShoppingList } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [weekOffset, setWeekOffset] = useState(0);
  const [editing, setEditing] = useState<MealPlanEntry | null>(null);
  const [showWeekNutrition, setShowWeekNutrition] = useState(false);
  const [nutritionDay, setNutritionDay] = useState<string | null>(null);

  const anchor = addDays(startOfWeek(new Date()), weekOffset * 7);
  const dates = useMemo(() => weekDates(anchor), [anchor]);

  const entries = useMemo(
    () => data.planEntries.filter((e) => dates.includes(e.date)).map((e) => ({ ...e, recipe: recipeById.get(e.recipeId) })),
    [data.planEntries, dates, recipeById],
  );
  const week = useMemo(() => weekTotals(entries), [entries]);
  const isEmpty = entries.length === 0;

  const confirmClear = () =>
    Alert.alert('Woche leeren?', 'Alle Einträge dieser Woche werden entfernt.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Leeren', style: 'destructive', onPress: () => clearWeek(dates) },
    ]);

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <BrandHeader
        title="Wochenplan"
        subtitle={`${formatDayShort(dates[0]!)} – ${formatDayShort(dates[6]!)}${weekOffset === 0 ? ' · diese Woche' : weekOffset === 1 ? ' · nächste Woche' : ''}`}
        right={
          <Row gap={spacing.xs}>
            <IconButton icon="chevron-back" size={36} accessibilityLabel="Vorherige Woche" onPress={() => setWeekOffset((w) => w - 1)} />
            <IconButton icon="chevron-forward" size={36} accessibilityLabel="Nächste Woche" onPress={() => setWeekOffset((w) => w + 1)} />
          </Row>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon="calendar-outline"
          title="Diese Woche ist noch frei"
          text="Füge Rezepte aus Entdecken oder deinen Favoriten hinzu – oder lass einzelne Tage bewusst offen."
          action={<Button label="Rezepte entdecken" onPress={() => router.push('/')} />}
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }}>
          {data.profile.showNutrition ? (
            <Pressable onPress={() => setShowWeekNutrition(true)} style={styles.weekBox} accessibilityRole="button">
              <Row style={{ justifyContent: 'space-between' }}>
                <Text variant="label">Wochenüberblick · Ø pro Tag ({week.daysWithEntries} {week.daysWithEntries === 1 ? 'Tag' : 'Tage'} geplant)</Text>
                <Ionicons name="chevron-forward" size={16} color={semantic.accentStrong} />
              </Row>
              <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }} gap={spacing.lg}>
                <Mini label="Energie" value={week.total.totalGrams ? formatNutrient(week.perDayAverage.values.ENERCC, 'kcal') : '–'} />
                <Mini label="Protein" value={week.total.totalGrams ? formatNutrient(week.perDayAverage.values.PROT625, 'g') : '–'} />
                <Mini label="KH" value={week.total.totalGrams ? formatNutrient(week.perDayAverage.values.CHO, 'g') : '–'} />
                <Mini label="Fett" value={week.total.totalGrams ? formatNutrient(week.perDayAverage.values.FAT, 'g') : '–'} />
                <Mini label="Ballastst." value={week.total.totalGrams ? formatNutrient(week.perDayAverage.values.FIBT, 'g') : '–'} />
              </Row>
              {week.total.totalGrams === 0 ? (
                <Text variant="caption" tone="muted" style={{ marginTop: spacing.xs }}>
                  Nährwerte erscheinen, sobald die Zutaten dem BLS zugeordnet sind.
                </Text>
              ) : null}
            </Pressable>
          ) : null}

          {dates.map((date, i) => {
            const dayEntries = entries.filter((e) => e.date === date);
            const totals = dayTotals(dayEntries);
            return (
              <View key={date} style={[styles.day, isToday(date) && styles.dayToday]}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text variant="subtitle">
                    {WEEKDAY_LABELS[i]} <Text variant="bodySmall" tone="muted">{formatDayShort(date)}</Text>
                  </Text>
                  {data.profile.showNutrition && dayEntries.length > 0 && totals.totalGrams > 0 ? (
                    <Pressable onPress={() => setNutritionDay(date)} style={styles.dayNutritionChip} accessibilityRole="button" accessibilityLabel={`Nährwerte für ${WEEKDAY_LABELS[i]} anzeigen`}>
                      <Ionicons name="pie-chart-outline" size={14} color={semantic.accentStrong} />
                      <Text variant="caption" style={{ color: semantic.accentStrong }}>
                        {formatNutrient(totals.values.ENERCC, 'kcal')} · {formatNutrient(totals.values.PROT625, 'g')} Protein
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={semantic.accentStrong} />
                    </Pressable>
                  ) : null}
                </Row>
                {data.profile.showNutrition && dayEntries.length > 0 && totals.totalGrams > 0 ? (
                  <Row gap={spacing.lg} style={{ flexWrap: 'wrap' }}>
                    <Mini label="KH" value={formatNutrient(totals.values.CHO, 'g')} />
                    <Mini label="Fett" value={formatNutrient(totals.values.FAT, 'g')} />
                    <Mini label="Ballastst." value={formatNutrient(totals.values.FIBT, 'g')} />
                    <Mini label="Omega-3" value={formatNutrient(totals.values.FAPUN3, 'g')} />
                  </Row>
                ) : null}
                {SLOTS.map((slot) => {
                  const slotEntries = dayEntries.filter((e) => e.mealSlot === slot.id);
                  return (
                    <View key={slot.id} style={styles.slot}>
                      <Text variant="caption" tone="muted" style={{ width: 84 }}>
                        {slot.label}
                      </Text>
                      <View style={{ flex: 1, gap: 6 }}>
                        {slotEntries.length === 0 ? (
                          <Pressable
                            onPress={() => router.push({ pathname: '/', params: {} })}
                            style={styles.emptySlot}
                            accessibilityLabel={`${slot.label} hinzufügen`}
                          >
                            <Text variant="caption" tone="muted">
                              frei
                            </Text>
                          </Pressable>
                        ) : (
                          slotEntries.map((e) => (
                            <Pressable key={e.id} onPress={() => setEditing(e)} style={styles.entry} accessibilityRole="button">
                              <Text variant="label" numberOfLines={1} style={{ flex: 1 }}>
                                {e.recipe?.title ?? 'Rezept nicht verfügbar'}
                              </Text>
                              <Text variant="caption" tone="muted">
                                {e.leftoverOfEntryId ? 'Reste · ' : ''}
                                {e.servingsEaten}
                                {e.servingsEaten !== e.servings ? `/${e.servings}` : ''} P.
                              </Text>
                            </Pressable>
                          ))
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}

          <Divider />
          <Button
            label="Einkaufsliste erstellen"
            icon="basket-outline"
            onPress={() => {
              regenerateShoppingList(dates);
              router.push('/einkaufsliste');
            }}
          />
          <Button label="Woche leeren" variant="ghost" onPress={confirmClear} />
        </ScrollView>
      )}

      <EntryEditor
        entry={editing}
        onClose={() => setEditing(null)}
        onUpdate={(patch) => editing && updatePlanEntry(editing.id, patch)}
        onRemove={() => {
          if (editing) removePlanEntry(editing.id);
          setEditing(null);
        }}
        onMove={() => {
          if (!editing) return;
          const id = editing.id;
          const e = editing;
          setEditing(null);
          router.push({ pathname: '/add-to-plan', params: { recipeId: e.recipeId, servings: String(e.servings), date: e.date, slot: e.mealSlot } });
          removePlanEntry(id);
        }}
        onLeftovers={() => {
          if (!editing) return;
          const remaining = editing.servings - editing.servingsEaten;
          if (remaining <= 0) return;
          const nextDay = addDays(new Date(editing.date), 1);
          const iso = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
          addToPlan({ recipeId: editing.recipeId, date: iso, mealSlot: 'lunch', servings: remaining, servingsEaten: remaining, leftoverOfEntryId: editing.id });
          setEditing(null);
        }}
        onOpen={() => {
          if (!editing) return;
          const id = editing.recipeId;
          setEditing(null);
          router.push({ pathname: '/recipe/[id]', params: { id } });
        }}
      />

      <Modal visible={nutritionDay !== null} animationType="slide" onRequestClose={() => setNutritionDay(null)}>
        {nutritionDay ? (
          <DayNutrition
            date={nutritionDay}
            label={WEEKDAY_LABELS[dates.indexOf(nutritionDay)] ?? ''}
            entries={entries.filter((e) => e.date === nutritionDay)}
            showReferenceValues={data.profile.showReferenceValues}
            paddingTop={insets.top}
            onClose={() => setNutritionDay(null)}
          />
        ) : null}
      </Modal>

      <Modal visible={showWeekNutrition} animationType="slide" onRequestClose={() => setShowWeekNutrition(false)}>
        <Screen style={{ paddingTop: insets.top }}>
          <Row style={[styles.header, { justifyContent: 'space-between' }]}>
            <Text variant="h2">Wochenüberblick</Text>
            <IconButton icon="close" accessibilityLabel="Schließen" onPress={() => setShowWeekNutrition(false)} />
          </Row>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl }}>
            <Text variant="bodySmall" tone="secondary">
              Durchschnitt pro geplantem Tag ({week.daysWithEntries} {week.daysWithEntries === 1 ? 'Tag' : 'Tage'}). Diese Zahlen sind eine Orientierung – kein Ziel und keine Bewertung.
            </Text>
            <NutritionPanel totals={week.perDayAverage} title="Ø pro Tag" showReferenceValues={data.profile.showReferenceValues} defaultExpanded />
            <NutritionPanel totals={week.total} title="Summe der Woche" showReferenceValues={false} />
          </ScrollView>
        </Screen>
      </Modal>
    </Screen>
  );
}

/** Nährwerte eines Tages: Summe aller gegessenen Portionen + Aufschlüsselung je Gericht. */
function DayNutrition({
  date,
  label,
  entries,
  showReferenceValues,
  paddingTop,
  onClose,
}: {
  date: string;
  label: string;
  entries: MealPlanEntry[];
  showReferenceValues: boolean;
  paddingTop: number;
  onClose: () => void;
}) {
  const totals = dayTotals(entries);
  return (
    <Screen style={{ paddingTop }}>
      <Row style={[styles.header, { justifyContent: 'space-between' }]}>
        <View>
          <Text variant="h2">Nährwerte · {label}</Text>
          <Text variant="caption" tone="muted">
            {formatDayShort(date)} · {entries.length} {entries.length === 1 ? 'Gericht' : 'Gerichte'}
          </Text>
        </View>
        <IconButton icon="close" accessibilityLabel="Schließen" onPress={onClose} />
      </Row>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl }}>
        <Text variant="bodySmall" tone="secondary">
          Summe der Portionen, die du an diesem Tag isst. Eine Orientierung – kein Ziel und keine Bewertung.
        </Text>
        <NutritionPanel totals={totals} title="Gesamt für diesen Tag" showReferenceValues={showReferenceValues} defaultExpanded />
        <Text variant="title">Je Gericht</Text>
        {SLOTS.map((slot) =>
          entries
            .filter((e) => e.mealSlot === slot.id)
            .map((e) => {
              const t = entryTotals(e);
              return (
                <View key={e.id} style={styles.dishRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" tone="muted">
                      {slot.label}
                      {e.leftoverOfEntryId ? ' · Reste' : ''}
                    </Text>
                    <Text variant="subtitle" numberOfLines={2}>
                      {e.recipe?.title ?? 'Rezept nicht verfügbar'}
                    </Text>
                    <Text variant="caption" tone="secondary">
                      {e.servingsEaten} {e.servingsEaten === 1 ? 'Portion' : 'Portionen'}
                      {t.totalGrams > 0
                        ? ` · ${formatNutrient(t.values.ENERCC, 'kcal')} · ${formatNutrient(t.values.PROT625, 'g')} Protein · ${formatNutrient(t.values.CHO, 'g')} KH · ${formatNutrient(t.values.FAT, 'g')} Fett`
                        : ' · Nährwerte noch nicht verfügbar'}
                    </Text>
                  </View>
                </View>
              );
            }),
        )}
      </ScrollView>
    </Screen>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

function EntryEditor({
  entry,
  onClose,
  onUpdate,
  onRemove,
  onMove,
  onLeftovers,
  onOpen,
}: {
  entry: MealPlanEntry | null;
  onClose: () => void;
  onUpdate: (patch: Partial<MealPlanEntry>) => void;
  onRemove: () => void;
  onMove: () => void;
  onLeftovers: () => void;
  onOpen: () => void;
}) {
  const { recipeById } = useApp();
  if (!entry) return null;
  const recipe = recipeById.get(entry.recipeId);
  const remaining = entry.servings - entry.servingsEaten;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text variant="h2" numberOfLines={2}>
          {recipe?.title ?? 'Eintrag'}
        </Text>
        <Text variant="label" tone="secondary" style={{ marginTop: spacing.md }}>
          Portionen kochen
        </Text>
        <Row style={{ flexWrap: 'wrap', marginTop: spacing.xs }} gap={spacing.sm}>
          {SERVING_OPTIONS.map((n) => (
            <Chip key={n} label={String(n)} small selected={n === entry.servings} onPress={() => onUpdate({ servings: n, servingsEaten: Math.min(entry.servingsEaten, n) })} />
          ))}
        </Row>
        <Text variant="label" tone="secondary" style={{ marginTop: spacing.md }}>
          Davon gegessen
        </Text>
        <Row style={{ flexWrap: 'wrap', marginTop: spacing.xs }} gap={spacing.sm}>
          {Array.from({ length: entry.servings }, (_, i) => i + 1).map((n) => (
            <Chip key={n} label={String(n)} small selected={n === entry.servingsEaten} onPress={() => onUpdate({ servingsEaten: n })} />
          ))}
        </Row>
        <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
          {remaining > 0 && !entry.leftoverOfEntryId ? (
            <Button label={`${remaining} ${remaining === 1 ? 'Portion' : 'Portionen'} als Reste für morgen eintragen`} variant="secondary" icon="repeat-outline" onPress={onLeftovers} />
          ) : null}
          <Row gap={spacing.sm}>
            <Button label="Rezept" variant="secondary" icon="book-outline" onPress={onOpen} style={{ flex: 1 }} />
            <Button label="Verschieben" variant="secondary" icon="swap-horizontal-outline" onPress={onMove} style={{ flex: 1 }} />
          </Row>
          <Button label="Aus dem Plan entfernen" variant="ghost" onPress={onRemove} />
          <Button label="Fertig" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  weekBox: { backgroundColor: semantic.surfaceAccent, borderRadius: radius.lg, padding: spacing.lg },
  day: { backgroundColor: semantic.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, ...shadows.soft },
  dayToday: { borderWidth: 1.5, borderColor: colors.brand.turquoise },
  slot: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  emptySlot: { paddingVertical: 6, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: semantic.border, borderStyle: 'dashed', alignSelf: 'flex-start' },
  entry: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: semantic.surfaceAccent },
  dayNutritionChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: semantic.surfaceAccent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  dishRow: { backgroundColor: semantic.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.soft },
  backdrop: { flex: 1, backgroundColor: 'rgba(28,28,28,0.35)' },
  sheet: { backgroundColor: semantic.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, paddingBottom: spacing.xxl },
});
