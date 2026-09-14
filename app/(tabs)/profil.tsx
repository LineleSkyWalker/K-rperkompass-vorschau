import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Divider, Notice, Row, Screen, Text } from '@/design-system/components';
import { colors, fonts, radius, semantic, spacing } from '@/design-system/tokens';
import { useApp } from '@/state/AppProvider';
import { ALLERGEN_LABELS, type Allergen } from '@/types/recipe';
import { SERVING_OPTIONS } from '@/domain/servings';
import { NUTRITION_DATA_AVAILABLE, NUTRITION_SOURCE } from '@/data/recipeSource';
import { REFERENCE_VALUES_VERIFIED } from '@/data/referenceValues';

export default function ProfileScreen() {
  const { data, updateProfile, session, isSupabase, signInWithEmail, signOut, deleteMyData, deleteAccount, recipeSource, recipes } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const p = data.profile;
  const [email, setEmail] = useState('');
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  const toggleDiet = (d: 'vegetarian' | 'vegan') =>
    updateProfile({ dietaryPreferences: p.dietaryPreferences.includes(d) ? p.dietaryPreferences.filter((x) => x !== d) : [...p.dietaryPreferences, d] });
  const toggleAllergen = (a: Allergen) =>
    updateProfile({ allergens: p.allergens.includes(a) ? p.allergens.filter((x) => x !== a) : [...p.allergens, a] });

  const confirmDeleteData = () =>
    Alert.alert('Alle Daten löschen?', 'Favoriten, Wochenplan, Einkaufsliste und Präferenzen werden gelöscht. Das lässt sich nicht rückgängig machen.', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: () => deleteMyData() },
    ]);
  const confirmDeleteAccount = () =>
    Alert.alert('Konto löschen?', 'Dein Konto und alle zugehörigen Daten werden dauerhaft gelöscht.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Konto löschen',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteAccount();
          if (error) Alert.alert('Das hat nicht geklappt', error);
        },
      },
    ]);

  return (
    <Screen style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl }}>
        <View style={{ paddingVertical: spacing.sm }}>
          <Text variant="h1">Profil</Text>
          <Text variant="bodySmall" tone="secondary">
            Verstehen. Fühlen. Verändern.
          </Text>
        </View>

        <Card>
          <Text variant="title">Ernährungspräferenzen</Text>
          <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }} gap={spacing.sm}>
            <Chip label="vegetarisch" selected={p.dietaryPreferences.includes('vegetarian')} onPress={() => toggleDiet('vegetarian')} />
            <Chip label="vegan" selected={p.dietaryPreferences.includes('vegan')} onPress={() => toggleDiet('vegan')} />
            <Chip label="familienfreundlich bevorzugt" selected={p.familyFriendly} onPress={() => updateProfile({ familyFriendly: !p.familyFriendly })} />
          </Row>
          <Divider />
          <Text variant="title">Allergien & Unverträglichkeiten</Text>
          <Text variant="caption" tone="muted" style={{ marginBottom: spacing.sm }}>
            Rezepte mit diesen Zutaten werden ausgeblendet.
          </Text>
          <Row style={{ flexWrap: 'wrap' }} gap={spacing.sm}>
            {(Object.keys(ALLERGEN_LABELS) as Allergen[]).map((a) => (
              <Chip key={a} label={ALLERGEN_LABELS[a]} small selected={p.allergens.includes(a)} onPress={() => toggleAllergen(a)} />
            ))}
          </Row>
          <Divider />
          <Text variant="title">Standard-Portionen</Text>
          <Row style={{ marginTop: spacing.sm, flexWrap: 'wrap' }} gap={spacing.sm}>
            {SERVING_OPTIONS.map((n) => (
              <Chip key={n} label={String(n)} small selected={p.defaultServings === n} onPress={() => updateProfile({ defaultServings: n })} />
            ))}
          </Row>
        </Card>

        <Card>
          <ToggleRow
            label="Nährwertangaben anzeigen"
            sub="Nur zur Information – ohne Ziele, ohne Bewertung."
            value={p.showNutrition}
            onChange={(v) => updateProfile({ showNutrition: v })}
          />
          <ToggleRow
            label="Referenzwerte als Orientierung"
            sub={REFERENCE_VALUES_VERIFIED ? 'Zeigt geprüfte Tages-Referenzwerte neben den Nährwerten.' : 'Wird verfügbar, sobald die Referenzwerte fachlich geprüft und hinterlegt sind.'}
            value={p.showReferenceValues}
            disabled={!REFERENCE_VALUES_VERIFIED}
            onChange={(v) => updateProfile({ showReferenceValues: v })}
          />
          <ToggleRow label="Benachrichtigungen" sub="Vorerst nur Vorbereitung – es werden keine Push-Nachrichten gesendet." value={p.notificationsEnabled} onChange={(v) => updateProfile({ notificationsEnabled: v })} />
        </Card>

        <Card>
          <Text variant="title">Konto</Text>
          {!isSupabase ? (
            <Notice style={{ marginTop: spacing.sm }} text="Die App läuft im lokalen Modus: Deine Daten bleiben auf diesem Gerät. Für Synchronisation zwischen Geräten wird ein Server (Supabase) konfiguriert." />
          ) : session ? (
            <>
              <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing.xs }}>
                Angemeldet als {session.user.email}
              </Text>
              <Button label="Abmelden" variant="secondary" onPress={signOut} style={{ marginTop: spacing.md }} />
            </>
          ) : (
            <>
              <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing.xs }}>
                Mit einem Konto werden Favoriten und Wochenplan auf allen Geräten synchronisiert. Wir schicken dir einen Anmeldelink per E-Mail – kein Passwort nötig.
              </Text>
              <TextInput value={email} onChangeText={setEmail} placeholder="E-Mail-Adresse" placeholderTextColor={semantic.textMuted} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
              <Button
                label="Anmeldelink senden"
                onPress={async () => {
                  const { error } = await signInWithEmail(email.trim());
                  setAuthMsg(error ?? 'Link gesendet – schau in dein Postfach.');
                }}
                style={{ marginTop: spacing.sm }}
              />
              {authMsg ? <Text variant="caption" tone="secondary" style={{ marginTop: spacing.sm }}>{authMsg}</Text> : null}
            </>
          )}
        </Card>

        <Card>
          <Text variant="title">Datenschutz</Text>
          <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing.xs }}>
            Wir speichern nur, was die App braucht: Präferenzen, Favoriten, Wochenplan, Einkaufsliste. Kein Gewicht, kein Kalorienziel, kein Tracking über Drittanbieter. Nutzungsstatistiken sind anonym.
          </Text>
          <Button label="Alle meine Daten löschen" variant="secondary" onPress={confirmDeleteData} style={{ marginTop: spacing.md }} />
          <Button label={session ? 'Konto löschen' : 'App zurücksetzen'} variant="ghost" onPress={confirmDeleteAccount} />
          <Button label="Onboarding erneut anzeigen" variant="ghost" onPress={() => router.push('/onboarding')} />
        </Card>

        <Card style={{ backgroundColor: colors.neutral.beige }}>
          <Text variant="label">Über die Daten</Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing.xs }}>
            {recipes.length} Rezepte ({recipeSource === 'local' ? 'lokale Rezeptbibliothek' : 'Server'}).{' '}
            {NUTRITION_DATA_AVAILABLE
              ? `Nährwerte: ${NUTRITION_SOURCE ?? 'Bundeslebensmittelschlüssel (BLS) 4.0, Max Rubner-Institut, CC BY 4.0'}.`
              : 'Nährwerte: noch nicht berechnet (BLS-Zuordnung ausstehend).'}
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: spacing.xs }}>
            KÖRPER.KOMPASS ist keine Diät-App und ersetzt keine medizinische oder ernährungstherapeutische Beratung.
          </Text>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ToggleRow({ label, sub, value, onChange, disabled }: { label: string; sub?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Row style={{ justifyContent: 'space-between', paddingVertical: spacing.sm }} gap={spacing.md}>
      <View style={{ flex: 1 }}>
        <Text variant="subtitle">{label}</Text>
        {sub ? (
          <Text variant="caption" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      <Switch value={value} onValueChange={onChange} disabled={disabled} trackColor={{ true: colors.brand.turquoise, false: semantic.borderStrong }} thumbColor="#fff" />
    </Row>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: spacing.md,
    backgroundColor: semantic.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: semantic.textPrimary,
    borderWidth: 1,
    borderColor: semantic.border,
  },
});
