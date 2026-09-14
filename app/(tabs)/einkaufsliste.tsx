import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, EmptyState, IconButton, Notice, Row, Screen, Text } from '@/design-system/components';
import { colors, fonts, radius, semantic, shadows, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { formatItemQuantity, groupByCategory } from '@/domain/shoppingList';
import { SHOPPING_CATEGORY_LABELS } from '@/types/recipe';
import { startOfWeek, weekDates } from '@/lib/dates';

export default function ShoppingListScreen() {
  const { data, regenerateShoppingList, toggleShoppingItem, addManualShoppingItem, removeShoppingItem, clearCheckedShoppingItems, togglePantry } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [newItem, setNewItem] = useState('');
  const [showHave, setShowHave] = useState(false);

  const visible = useMemo(() => data.shoppingItems.filter((i) => showHave || !i.alreadyHave), [data.shoppingItems, showHave]);
  const groups = useMemo(() => groupByCategory(visible), [visible]);
  const checkedCount = data.shoppingItems.filter((i) => i.checked).length;
  const haveCount = data.shoppingItems.filter((i) => i.alreadyHave).length;
  const thisWeek = weekDates(startOfWeek(new Date()));
  const hasPlan = data.planEntries.some((e) => thisWeek.includes(e.date));

  const add = () => {
    const name = newItem.trim();
    if (!name) return;
    addManualShoppingItem(name);
    setNewItem('');
  };

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="h1">Einkaufsliste</Text>
          <IconButton icon="refresh" size={36} accessibilityLabel="Aus Wochenplan aktualisieren" onPress={() => regenerateShoppingList(thisWeek)} />
        </Row>
        <Text variant="bodySmall" tone="secondary">
          {data.shoppingItems.length === 0 ? 'noch leer' : `${visible.length} Produkte · ${checkedCount} abgehakt${haveCount ? ` · ${haveCount} vorrätig` : ''}`}
        </Text>
      </View>

      {data.shoppingItems.length === 0 ? (
        <EmptyState
          icon="basket-outline"
          title="Noch nichts auf der Liste"
          text={hasPlan ? 'Erstelle die Liste aus deinem Wochenplan – gleiche Zutaten werden automatisch zusammengefasst.' : 'Plane zuerst ein paar Rezepte für diese Woche, dann erzeugt die App die Liste für dich.'}
          action={
            hasPlan ? (
              <Button label="Aus Wochenplan erstellen" icon="calendar-outline" onPress={() => regenerateShoppingList(thisWeek)} />
            ) : (
              <Button label="Zum Wochenplan" onPress={() => router.push('/wochenplan')} />
            )
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <Row style={styles.addRow} gap={spacing.sm}>
            <TextInput
              value={newItem}
              onChangeText={setNewItem}
              placeholder="Eigenes Produkt hinzufügen …"
              placeholderTextColor={semantic.textMuted}
              style={styles.input}
              onSubmitEditing={add}
              returnKeyType="done"
            />
            <IconButton icon="add" accessibilityLabel="Hinzufügen" background={semantic.accentStrong} color={semantic.textOnAccent} onPress={add} />
          </Row>

          {groups.map((g) => (
            <View key={g.category} style={styles.group}>
              <Text variant="label" tone="secondary" style={{ marginBottom: spacing.xs }}>
                {SHOPPING_CATEGORY_LABELS[g.category]}
              </Text>
              {g.items.map((item) => (
                <Row key={item.id} style={[styles.item, item.alreadyHave && { opacity: 0.5 }]} gap={spacing.sm}>
                  <Pressable
                    onPress={() => toggleShoppingItem(item.id, 'checked')}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: item.checked }}
                    style={[styles.checkbox, item.checked && styles.checkboxOn]}
                    hitSlop={8}
                  >
                    {item.checked ? <Ionicons name="checkmark" size={16} color={semantic.textOnAccent} /> : null}
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" style={item.checked ? styles.strike : undefined}>
                      {stripQualifier(item.name)}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {formatItemQuantity({ quantity: item.quantity, unit: item.unit as never, toTaste: item.quantity === null && !item.manual })}
                      {item.alreadyHave ? ' · vorrätig' : ''}
                    </Text>
                  </View>
                  {item.manual ? (
                    <IconButton icon="trash-outline" size={32} background="transparent" accessibilityLabel="Entfernen" onPress={() => removeShoppingItem(item.id)} />
                  ) : (
                    <Pressable
                      onPress={() => {
                        toggleShoppingItem(item.id, 'alreadyHave');
                        if (item.ingredientId) togglePantry(item.ingredientId);
                      }}
                      hitSlop={8}
                      accessibilityLabel={item.alreadyHave ? 'Wieder auf die Liste' : 'Habe ich bereits'}
                      style={[styles.haveBtn, item.alreadyHave && styles.haveBtnOn]}
                    >
                      <Text variant="caption" tone={item.alreadyHave ? 'onAccent' : 'accent'}>
                        {item.alreadyHave ? 'vorrätig' : 'habe ich'}
                      </Text>
                    </Pressable>
                  )}
                </Row>
              ))}
            </View>
          ))}

          {haveCount > 0 ? (
            <Button label={showHave ? 'Vorräte ausblenden' : `${haveCount} vorrätige Produkte anzeigen`} variant="ghost" onPress={() => setShowHave((s) => !s)} />
          ) : null}
          {checkedCount > 0 ? <Button label={`${checkedCount} abgehakte entfernen`} variant="secondary" onPress={clearCheckedShoppingItems} /> : null}
          <Notice text="Mengen sind auf die geplanten Portionen umgerechnet. „Habe ich“ merkt sich die Zutat als Vorrat – auch für die nächste Liste." />
        </ScrollView>
      )}
    </Screen>
  );
}

function stripQualifier(name: string): string {
  const idx = name.indexOf(',');
  return idx > 0 ? name.slice(0, idx) : name;
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  addRow: { alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: semantic.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: semantic.textPrimary,
    borderWidth: 1,
    borderColor: semantic.border,
  },
  group: { backgroundColor: semantic.surface, borderRadius: radius.lg, padding: spacing.lg, ...shadows.soft },
  item: { paddingVertical: 8 },
  checkbox: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: colors.brand.turquoise, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.brand.turquoise },
  strike: { textDecorationLine: 'line-through', color: semantic.textMuted },
  haveBtn: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: semantic.surfaceAccent },
  haveBtnOn: { backgroundColor: semantic.accentStrong },
});
