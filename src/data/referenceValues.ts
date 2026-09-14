import type { NutrientCode } from '@/types/nutrition';

/**
 * Referenzwerte (Orientierung pro Tag, Erwachsene) – OPTIONAL und standardmäßig AUS.
 *
 * WICHTIG: Diese Tabelle ist bewusst LEER, bis die Werte fachlich geprüft und
 * mit Quelle (z. B. D-A-CH-Referenzwerte der DGE, Ausgabe/Jahr) eingetragen sind.
 * Die App zeigt Referenzwerte erst an, wenn REFERENCE_VALUES_VERIFIED = true.
 * Es werden nie geschätzte oder aus dem Gedächtnis erfundene Werte verwendet.
 *
 * Markenregel: Referenzwerte sind Orientierung, keine Vorgabe. Keine Ampel,
 * keine „du hast zu wenig/zu viel“-Aussagen.
 *
 * [NOCH FESTZULEGEN]: Werte, Quelle, Altersgruppe/Geschlecht-Differenzierung.
 */
export const REFERENCE_VALUES_VERIFIED = false;
export const REFERENCE_VALUES_SOURCE: string | null = null;

export const REFERENCE_VALUES: Partial<Record<NutrientCode, number>> = {};
