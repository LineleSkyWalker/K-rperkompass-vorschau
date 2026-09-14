/**
 * KÖRPER.KOMPASS Design-Tokens
 * Zentrale Stelle für Farben, Typografie, Abstände, Radien.
 * Markenfarben laut Masterdatensatz: Türkis #1AC7C9 als Hauptfarbe,
 * helles Türkis für Flächen, dunkles Petrol für Text/Akzente, warmes Beige,
 * Off-White, Anthrazit.
 *
 * Bewusst KEIN Rot/Grün-System für Lebensmittel – es gibt keine
 * „gut/schlecht“-Semantik in der Farbpalette.
 */
export const colors = {
  brand: {
    turquoise: '#1AC7C9',
    turquoiseLight: '#5EDADB',
    turquoiseSoft: '#E3F7F7',
    turquoiseTint: '#F1FBFB',
    petrol: '#0F5E60',
    petrolDark: '#083E40',
  },
  neutral: {
    offWhite: '#FBF9F5',
    white: '#FFFFFF',
    beige: '#F2EBDF',
    beigeDark: '#E6DCCB',
    sand: '#D9CDB9',
    anthracite: '#2B2B2B',
    ink: '#1C1C1C',
    grey700: '#5A5A5A',
    grey500: '#8A8A8A',
    grey300: '#C9C9C9',
    grey200: '#E4E4E4',
    grey100: '#F1F1F1',
  },
  /** Funktionale Farben – neutral, nicht bewertend */
  feedback: {
    info: '#1AC7C9',
    warmAccent: '#E8A86B', // warmes Apricot für Hinweise (z. B. „unvollständig“)
    error: '#C96A5B', // nur für technische Fehler (kein Internet etc.)
  },
  overlay: 'rgba(28, 28, 28, 0.45)',
} as const;

export const semantic = {
  background: colors.neutral.offWhite,
  surface: colors.neutral.white,
  surfaceMuted: colors.neutral.beige,
  surfaceAccent: colors.brand.turquoiseSoft,
  textPrimary: colors.neutral.ink,
  textSecondary: colors.neutral.grey700,
  textMuted: colors.neutral.grey500,
  textOnAccent: colors.neutral.white,
  accent: colors.brand.turquoise,
  accentStrong: colors.brand.petrol,
  border: colors.neutral.grey200,
  borderStrong: colors.neutral.grey300,
  tabActive: colors.brand.petrol,
  tabInactive: colors.neutral.grey500,
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  display: 'BebasNeue_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: 1 },
  h1: { fontFamily: fonts.display, fontSize: 32, lineHeight: 34, letterSpacing: 0.8 },
  h2: { fontFamily: fonts.display, fontSize: 26, lineHeight: 28, letterSpacing: 0.6 },
  title: { fontFamily: fonts.bodySemiBold, fontSize: 20, lineHeight: 26 },
  subtitle: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

export const theme = { colors, semantic, spacing, radius, fonts, typography, shadows };
export type Theme = typeof theme;
