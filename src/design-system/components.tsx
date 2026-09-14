import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text as RNText,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, semantic, shadows, spacing, typography, colors } from './tokens';

// ---------------------------------------------------------------------------
// Text
// ---------------------------------------------------------------------------
type Variant = keyof typeof typography;
type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'onAccent';

const toneColor: Record<Tone, string> = {
  primary: semantic.textPrimary,
  secondary: semantic.textSecondary,
  muted: semantic.textMuted,
  accent: semantic.accentStrong,
  onAccent: semantic.textOnAccent,
};

export function Text({
  variant = 'body',
  tone = 'primary',
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone }) {
  return <RNText {...rest} style={[typography[variant], { color: toneColor[tone] }, style]} />;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[styles.screen, style]}>
      {children}
    </View>
  );
}

export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

export function Row({ style, children, gap = spacing.sm, ...rest }: ViewProps & { gap?: number }) {
  return (
    <View {...rest} style={[styles.row, { gap }, style]}>
      {children}
    </View>
  );
}

export function Spacer({ size = spacing.lg }: { size?: number }) {
  return <View style={{ height: size }} />;
}

export function Divider() {
  return <View style={styles.divider} />;
}

// ---------------------------------------------------------------------------
// Buttons & Chips
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function Button({
  label,
  variant = 'primary',
  icon,
  loading,
  style,
  disabled,
  ...rest
}: PressableProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary' ? semantic.accentStrong : variant === 'secondary' ? semantic.surfaceAccent : 'transparent';
  const fg = variant === 'primary' ? semantic.textOnAccent : semantic.accentStrong;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: pressed || disabled ? 0.7 : 1 },
        variant === 'ghost' && styles.buttonGhost,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
          <RNText style={[typography.subtitle, { color: fg }]}>{label}</RNText>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  icon,
  size = 44,
  color = semantic.accentStrong,
  background = semantic.surface,
  style,
  accessibilityLabel,
  ...rest
}: PressableProps & {
  icon: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      {...rest}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        shadows.soft,
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  small,
  style,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const content = (
    <RNText
      style={[
        small ? typography.caption : typography.label,
        { color: selected ? semantic.textOnAccent : semantic.accentStrong },
      ]}
      numberOfLines={1}
    >
      {label}
    </RNText>
  );
  const chipStyle = [
    styles.chip,
    small && styles.chipSmall,
    { backgroundColor: selected ? semantic.accentStrong : semantic.surfaceAccent },
    style,
  ];
  if (!onPress) return <View style={chipStyle}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [chipStyle, { opacity: pressed ? 0.7 : 1 }]}>
      {content}
    </Pressable>
  );
}

export function Tag({ label }: { label: string }) {
  return (
    <View style={styles.tag}>
      <RNText style={[typography.caption, { color: semantic.textSecondary }]}>{label}</RNText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
export function EmptyState({
  icon = 'leaf-outline',
  title,
  text,
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={semantic.accentStrong} />
      </View>
      <Text variant="title" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {text ? (
        <Text variant="body" tone="secondary" style={{ textAlign: 'center' }}>
          {text}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.md }}>{action}</View> : null}
    </View>
  );
}

export function LoadingState({ label = 'Wird geladen …' }: { label?: string }) {
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={semantic.accent} size="large" />
      <Text variant="bodySmall" tone="muted">
        {label}
      </Text>
    </View>
  );
}

export function Notice({ text, tone = 'info', style }: { text: string; tone?: 'info' | 'warm'; style?: StyleProp<ViewStyle> }) {
  const bg = tone === 'info' ? semantic.surfaceAccent : '#FBEEDF';
  const fg = tone === 'info' ? semantic.accentStrong : '#8A5A2B';
  return (
    <View style={[styles.notice, { backgroundColor: bg }, style]}>
      <Ionicons name={tone === 'info' ? 'information-circle-outline' : 'alert-circle-outline'} size={18} color={fg} />
      <RNText style={[typography.bodySmall, { color: fg, flex: 1 }]}>{text}</RNText>
    </View>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text variant="h2" style={[{ marginBottom: spacing.sm }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: semantic.background },
  card: {
    backgroundColor: semantic.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: semantic.border, marginVertical: spacing.md },
  button: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    minHeight: 48,
  },
  buttonGhost: { paddingHorizontal: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  chipSmall: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral.beige,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: semantic.surfaceAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
