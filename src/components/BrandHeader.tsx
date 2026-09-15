import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '@/design-system/components';
import { colors, spacing } from '@/design-system/tokens';

const FIGURE = require('../../assets/brand/figure-petrol.png');

/**
 * Kompakter Markenkopf für die Tabs: Logo-Figur + Wortmarke, darunter der
 * Screen-Titel. Bewusst klein, damit auf dem Smartphone Platz für den Inhalt bleibt.
 */
export function BrandHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.brandRow}>
        <Image source={FIGURE} style={styles.figure} contentFit="contain" accessibilityLabel="KÖRPER.KOMPASS Logo" />
        <Text variant="label" style={styles.wordmark}>
          KÖRPER.KOMPASS
        </Text>
      </View>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text variant="h1">{title}</Text>
          {subtitle ? (
            <Text variant="bodySmall" tone="secondary">
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  figure: { width: 16, height: 24 },
  wordmark: { color: colors.brand.petrol, letterSpacing: 2, fontSize: 11 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
