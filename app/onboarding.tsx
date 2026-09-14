import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip, Row, Screen, Text } from '@/design-system/components';
import { colors, radius, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { ALLERGEN_LABELS, type Allergen } from '@/types/recipe';

const TIME_OPTIONS = [
  { label: 'bis 15 Min.', value: 15 },
  { label: 'bis 30 Min.', value: 30 },
  { label: 'bis 45 Min.', value: 45 },
  { label: 'egal', value: null },
];

/**
 * Onboarding – bewusst ohne Gewicht, BMI, Wunschgewicht oder Kalorienziel.
 */
export default function OnboardingScreen() {
  const { data, updateProfile } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [diet, setDiet] = useState<('vegetarian' | 'vegan')[]>(data.profile.dietaryPreferences);
  const [allergens, setAllergens] = useState<Allergen[]>(data.profile.allergens);
  const [family, setFamily] = useState(data.profile.familyFriendly);
  const [time, setTime] = useState<number | null>(data.profile.preferredMaxCookTime);

  const finish = () => {
    updateProfile({ dietaryPreferences: diet, allergens, familyFriendly: family, preferredMaxCookTime: time, onboardingCompleted: true });
    router.back();
  };

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl, paddingBottom: spacing.xxxl }}>
        <View style={styles.hero}>
          <Text variant="display" style={{ color: colors.brand.petrol }}>
            KÖRPER.KOMPASS
          </Text>
          <Text variant="subtitle" tone="secondary">
            Verstehen. Fühlen. Verändern.
          </Text>
          <Text variant="body" style={{ marginTop: spacing.md }}>
            Diese App hilft dir bei einer einzigen Frage: Was möchte ich heute oder diese Woche essen? Keine Verbote, keine Kalorienziele – nur Ideen, die zu dir passen.
          </Text>
        </View>

        <View>
          <Text variant="h2">Was soll bei deinen Rezepten berücksichtigt werden?</Text>
          <Text variant="bodySmall" tone="muted" style={{ marginTop: spacing.xs }}>
            Alles optional. Du kannst es jederzeit im Profil ändern.
          </Text>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Ernährungsweise
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            <Chip label="vegetarisch" selected={diet.includes('vegetarian')} onPress={() => setDiet((d) => (d.includes('vegetarian') ? d.filter((x) => x !== 'vegetarian') : [...d, 'vegetarian']))} />
            <Chip label="vegan" selected={diet.includes('vegan')} onPress={() => setDiet((d) => (d.includes('vegan') ? d.filter((x) => x !== 'vegan') : [...d, 'vegan']))} />
          </Row>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Allergien & Unverträglichkeiten
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
              <Chip key={a} label={ALLERGEN_LABELS[a]} small selected={allergens.includes(a)} onPress={() => setAllergens((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]))} />
            ))}
          </Row>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Kochst du für Kinder oder Familie?
          </Text>
          <Row gap={spacing.sm}>
            <Chip label="Ja, häufig" selected={family} onPress={() => setFamily(true)} />
            <Chip label="Eher nicht" selected={!family} onPress={() => setFamily(false)} />
          </Row>
        </View>

        <View>
          <Text variant="label" tone="secondary" style={{ marginBottom: spacing.sm }}>
            Wie viel Zeit hast du meistens zum Kochen?
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {TIME_OPTIONS.map((t) => (
              <Chip key={t.label} label={t.label} selected={time === t.value} onPress={() => setTime(t.value)} />
            ))}
          </Row>
        </View>

        <Button label="Los geht's" icon="arrow-forward" onPress={finish} />
        <Button label="Überspringen" variant="ghost" onPress={() => { updateProfile({ onboardingCompleted: true }); router.back(); }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brand.turquoiseSoft, borderRadius: radius.xl, padding: spacing.xl },
});
