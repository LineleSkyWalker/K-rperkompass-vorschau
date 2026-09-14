import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from '@/design-system/components';
import { radius, semantic, spacing } from '@/design-system/tokens';
import { MOOD_OPTIONS } from '@/domain/filters';

/**
 * „Wonach ist mir gerade?“ – das KÖRPER.KOMPASS-Feature.
 * Menschen dürfen nach Bedürfnis wählen, nicht nur nach Nährwerten.
 */
export function MoodSheet({
  visible,
  selected,
  onChange,
  onClose,
}: {
  visible: boolean;
  selected: string[];
  onChange: (moods: string[]) => void;
  onClose: () => void;
}) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text variant="h2">Wonach ist mir gerade?</Text>
        <Text variant="bodySmall" tone="secondary" style={{ marginTop: spacing.xs }}>
          Nimm kurz wahr, was heute passen würde. Du kannst mehrere Dinge auswählen.
        </Text>
        <View style={styles.grid}>
          {MOOD_OPTIONS.map((m) => (
            <Chip key={m.id} label={m.label} selected={selected.includes(m.id)} onPress={() => toggle(m.id)} />
          ))}
        </View>
        <View style={styles.actions}>
          {selected.length > 0 ? <Button label="Auswahl löschen" variant="ghost" onPress={() => onChange([])} /> : <View />}
          <Button label="Zeig mir Rezepte" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(28,28,28,0.35)' },
  sheet: {
    backgroundColor: semantic.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: semantic.borderStrong, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl },
});
