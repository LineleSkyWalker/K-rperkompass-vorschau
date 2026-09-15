import React from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, IconButton, Row, Screen, Text } from '@/design-system/components';
import { colors, semantic, spacing } from '@/design-system/tokens';
import { DATENSCHUTZ, IMPRESSUM, NUTZUNG, OPERATOR, type LegalDocument } from '@/data/legal';
import { useApp } from '@/state/AppProvider';

const DOCS: Record<string, LegalDocument> = { impressum: IMPRESSUM, datenschutz: DATENSCHUTZ, nutzung: NUTZUNG };

/** Impressum, Datenschutzerklärung, Nutzungshinweise und Bildnachweise. */
export default function LegalScreen() {
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recipes } = useApp();

  const isCredits = doc === 'bildnachweise';
  const document = doc ? DOCS[doc] : undefined;
  const title = isCredits ? 'Bildnachweise' : (document?.title ?? 'Rechtliches');

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <Row style={styles.header}>
        <IconButton icon="chevron-back" accessibilityLabel="Zurück" onPress={() => (router.canGoBack() ? router.back() : router.replace('/profil'))} />
        <Text variant="h2" style={{ flex: 1 }}>
          {title}
        </Text>
      </Row>
      <ScrollView contentContainerStyle={styles.content}>
        {isCredits ? (
          <Credits recipes={recipes} />
        ) : document ? (
          <>
            {document.intro ? (
              <Text variant="bodySmall" tone="secondary">
                {document.intro}
              </Text>
            ) : null}
            {document.sections.map((s) => (
              <View key={s.title} style={{ gap: spacing.sm }}>
                <Text variant="title">{s.title}</Text>
                {s.paragraphs.map((p, i) => (
                  <Text key={i} variant="body" tone="secondary">
                    {p}
                  </Text>
                ))}
              </View>
            ))}
            {document.id === 'impressum' ? (
              <Row gap={spacing.sm} style={{ flexWrap: 'wrap' }}>
                <Button label="E-Mail schreiben" variant="secondary" icon="mail-outline" onPress={() => Linking.openURL(`mailto:${OPERATOR.emailAscii}`)} />
                <Button label="Anrufen" variant="secondary" icon="call-outline" onPress={() => Linking.openURL(`tel:${OPERATOR.phoneIntl}`)} />
              </Row>
            ) : null}
          </>
        ) : (
          <Text variant="body">Seite nicht gefunden.</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

function Credits({ recipes }: { recipes: { id: string; title: string; image: { url: string; sourceType: string; sourceName?: string; license?: string; attribution?: string; sourceUrl?: string } | null }[] }) {
  const withImages = recipes.filter((r) => r.image?.url);
  return (
    <>
      <Text variant="bodySmall" tone="secondary">
        Die Rezeptfotos stammen von Wikimedia Commons und stehen unter freien Lizenzen. Wir danken den Fotografinnen und Fotografen. Nährwertdaten: Bundeslebensmittelschlüssel (BLS) 4.0, Max Rubner-Institut, CC BY 4.0.
      </Text>
      {withImages.length === 0 ? (
        <Text variant="body" tone="muted">
          Derzeit sind keine Fotos hinterlegt.
        </Text>
      ) : (
        withImages.map((r) => (
          <Card key={r.id} style={{ gap: 2 }}>
            <Text variant="subtitle">{r.title}</Text>
            <Text variant="caption" tone="secondary">
              {r.image?.attribution ?? r.image?.sourceName}
              {r.image?.license ? ` · ${r.image.license}` : ''}
            </Text>
            {r.image?.sourceUrl ? (
              <Text variant="caption" style={{ color: colors.brand.petrol }} onPress={() => Linking.openURL(r.image!.sourceUrl!)}>
                Quelle öffnen
              </Text>
            ) : null}
          </Card>
        ))
      )}
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, backgroundColor: semantic.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxxl },
});
