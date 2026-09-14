import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notice, Row, Text } from '@/design-system/components';
import { colors, radius, semantic, spacing } from '@/design-system/tokens';
import {
  NUTRIENT_DEFINITIONS,
  NUTRIENT_GROUP_LABELS,
  type NutrientCode,
  type NutrientGroup,
  type NutrientTotals,
} from '@/types/nutrition';
import { coverage, formatNutrient, NUTRITION_DISCLAIMER, omegaRatio } from '@/domain/nutrition';
import { REFERENCE_VALUES, REFERENCE_VALUES_VERIFIED } from '@/data/referenceValues';

const SUMMARY: NutrientCode[] = ['ENERCC', 'PROT625', 'CHO', 'FAT', 'FIBT'];
const GROUP_ORDER: NutrientGroup[] = ['fatty_acid', 'vitamin_fat_soluble', 'vitamin_water_soluble', 'mineral'];

function groupCodes(group: NutrientGroup): NutrientCode[] {
  return (Object.values(NUTRIENT_DEFINITIONS).filter((d) => d.group === group).sort((a, b) => a.order - b.order)).map((d) => d.code);
}

/**
 * Nährwertanzeige – informativ, ruhig, ohne Bewertung.
 * Zeigt Vollständigkeit ehrlich an (fehlende BLS-Werte ≠ 0).
 */
export function NutritionPanel({
  totals,
  title = 'Nährwerte pro Portion',
  showReferenceValues = false,
  defaultExpanded = false,
}: {
  totals: NutrientTotals;
  title?: string;
  showReferenceValues?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const unavailable = totals.totalGrams <= 0;
  const ratio = omegaRatio(totals);

  if (unavailable) {
    return (
      <Notice
        tone="warm"
        text="Nährwerte sind für dieses Rezept noch nicht berechnet. Sie erscheinen, sobald die Zutaten dem Bundeslebensmittelschlüssel zugeordnet sind."
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <Text variant="title">{title}</Text>
      {totals.unmappedIngredients > 0 ? (
        <Notice
          tone="warm"
          style={{ marginTop: spacing.sm }}
          text={`${totals.unmappedIngredients} Zutat${totals.unmappedIngredients > 1 ? 'en' : ''} ohne Nährwertdaten – die Angaben sind unvollständig.`}
        />
      ) : null}

      <View style={styles.summaryRow}>
        {SUMMARY.map((code) => (
          <View key={code} style={styles.summaryTile}>
            <Text variant="caption" tone="muted">
              {NUTRIENT_DEFINITIONS[code].shortLabel ?? NUTRIENT_DEFINITIONS[code].label}
            </Text>
            <Text variant="subtitle">{formatNutrient(totals.values[code], NUTRIENT_DEFINITIONS[code].unit)}</Text>
            <CoverageDot totals={totals} code={code} />
          </View>
        ))}
      </View>

      <View style={styles.omegaBox}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text variant="label">Omega-3</Text>
          <Text variant="label">{formatNutrient(totals.values.FAPUN3, 'g')}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <Text variant="label">Omega-6</Text>
          <Text variant="label">{formatNutrient(totals.values.FAPUN6, 'g')}</Text>
        </Row>
        <Row style={{ justifyContent: 'space-between', marginTop: 4 }}>
          <Text variant="label" tone="accent">
            Verhältnis Omega-6 : Omega-3
          </Text>
          <Text variant="label" tone="accent">
            {ratio.text}
            {!ratio.complete ? ' *' : ''}
          </Text>
        </Row>
        {!ratio.complete ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 4 }}>
            * Für einzelne Zutaten liegen keine Fettsäurewerte vor.
          </Text>
        ) : null}
      </View>

      <Pressable onPress={() => setExpanded((e) => !e)} style={styles.expandBtn} accessibilityRole="button">
        <Text variant="label" tone="accent">
          {expanded ? 'Weniger anzeigen' : 'Alle Vitamine, Mineralstoffe & Fettsäuren'}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={semantic.accentStrong} />
      </Pressable>

      {expanded
        ? GROUP_ORDER.map((group) => (
            <View key={group} style={styles.group}>
              <Text variant="label" tone="secondary" style={{ marginBottom: 6 }}>
                {NUTRIENT_GROUP_LABELS[group]}
              </Text>
              {groupCodes(group).map((code) => {
                const def = NUTRIENT_DEFINITIONS[code];
                const ref = showReferenceValues && REFERENCE_VALUES_VERIFIED ? REFERENCE_VALUES[code] : undefined;
                return (
                  <Row key={code} style={styles.line}>
                    <Text variant="bodySmall" style={{ flex: 1 }}>
                      {def.label}
                    </Text>
                    <Text variant="bodySmall" tone="secondary">
                      {formatNutrient(totals.values[code], def.unit)}
                      {ref ? ` · Ref. ${formatNutrient(ref, def.unit)}` : ''}
                    </Text>
                    <CoverageDot totals={totals} code={code} />
                  </Row>
                );
              })}
            </View>
          ))
        : null}

      <Row style={{ marginTop: spacing.md }} gap={6}>
        <View style={[styles.dot, { backgroundColor: colors.brand.turquoise }]} />
        <Text variant="caption" tone="muted">vollständig</Text>
        <View style={[styles.dot, { backgroundColor: colors.feedback.warmAccent, marginLeft: spacing.sm }]} />
        <Text variant="caption" tone="muted">für Teile der Zutaten kein Wert im BLS</Text>
      </Row>
      <Text variant="caption" tone="muted" style={{ marginTop: spacing.sm }}>
        {NUTRITION_DISCLAIMER}
      </Text>
    </View>
  );
}

function CoverageDot({ totals, code }: { totals: NutrientTotals; code: NutrientCode }) {
  const c = coverage(totals, code);
  const complete = c >= 0.999 && totals.unmappedIngredients === 0;
  return (
    <View
      accessibilityLabel={complete ? 'vollständig' : 'unvollständig'}
      style={[styles.dot, { backgroundColor: complete ? colors.brand.turquoise : colors.feedback.warmAccent, marginLeft: 6 }]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: semantic.surface, borderRadius: radius.lg, padding: spacing.lg },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  summaryTile: {
    flexGrow: 1,
    minWidth: 96,
    backgroundColor: semantic.surfaceAccent,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  omegaBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.neutral.beige },
  expandBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.md, paddingVertical: spacing.xs },
  group: { marginTop: spacing.md },
  line: { justifyContent: 'space-between', paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
