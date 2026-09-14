/**
 * Nährstoff-Typen auf Basis des Bundeslebensmittelschlüssels (BLS) 4.0
 * Quelle: Max Rubner-Institut (2025), BLS 4.0, CC BY 4.0
 * Alle Werte beziehen sich auf 100 g essbaren Anteil.
 */

/** BLS-Spaltencodes, die die App auswertet (Untermenge der 138 Komponenten). */
export const NUTRIENT_CODES = [
  // Energie
  'ENERCC',
  'ENERCJ',
  // Makronährstoffe
  'PROT625',
  'FAT',
  'CHO',
  'FIBT',
  'SUGAR',
  'WATER',
  'ALC',
  // Fettsäuren
  'FASAT',
  'FAMS',
  'FAPU',
  'FAPUN3',
  'FAPUN6',
  'F18:3CN3', // Alpha-Linolensäure (ALA)
  'F20:5CN3', // EPA
  'F22:6CN3', // DHA
  'F18:2CN6', // Linolsäure
  'F20:4CN6', // Arachidonsäure
  'CHORL',
  // Fettlösliche Vitamine
  'VITA',
  'CARTB',
  'VITD',
  'VITE',
  'VITK',
  // Wasserlösliche Vitamine
  'THIA',
  'RIBF',
  'NIAEQ',
  'PANTAC',
  'VITB6',
  'BIOT',
  'FOL',
  'VITB12',
  'VITC',
  // Mineralstoffe & Spurenelemente
  'NA',
  'NACL',
  'K',
  'CA',
  'MG',
  'P',
  'FE',
  'ZN',
  'ID',
  'CU',
  'MN',
  'FD',
  'CR',
  'MO',
] as const;

export type NutrientCode = (typeof NUTRIENT_CODES)[number];

export type NutrientUnit = 'kcal' | 'kJ' | 'g' | 'mg' | 'µg';

export type NutrientGroup =
  | 'energy'
  | 'macro'
  | 'fatty_acid'
  | 'vitamin_fat_soluble'
  | 'vitamin_water_soluble'
  | 'mineral';

export interface NutrientDefinition {
  code: NutrientCode;
  /** Anzeigename (deutsch) */
  label: string;
  /** Kurzform für kompakte Anzeigen */
  shortLabel?: string;
  unit: NutrientUnit;
  group: NutrientGroup;
  /** Reihenfolge innerhalb der Gruppe */
  order: number;
}

export const NUTRIENT_DEFINITIONS: Record<NutrientCode, NutrientDefinition> = {
  ENERCC: { code: 'ENERCC', label: 'Energie', unit: 'kcal', group: 'energy', order: 1 },
  ENERCJ: { code: 'ENERCJ', label: 'Energie', unit: 'kJ', group: 'energy', order: 2 },
  PROT625: { code: 'PROT625', label: 'Protein', unit: 'g', group: 'macro', order: 1 },
  FAT: { code: 'FAT', label: 'Fett', unit: 'g', group: 'macro', order: 2 },
  CHO: { code: 'CHO', label: 'Kohlenhydrate', shortLabel: 'KH', unit: 'g', group: 'macro', order: 3 },
  SUGAR: { code: 'SUGAR', label: 'davon Zucker', unit: 'g', group: 'macro', order: 4 },
  FIBT: { code: 'FIBT', label: 'Ballaststoffe', unit: 'g', group: 'macro', order: 5 },
  WATER: { code: 'WATER', label: 'Wasser', unit: 'g', group: 'macro', order: 6 },
  ALC: { code: 'ALC', label: 'Alkohol', unit: 'g', group: 'macro', order: 7 },
  FASAT: { code: 'FASAT', label: 'Gesättigte Fettsäuren', unit: 'g', group: 'fatty_acid', order: 1 },
  FAMS: { code: 'FAMS', label: 'Einfach ungesättigte Fettsäuren', unit: 'g', group: 'fatty_acid', order: 2 },
  FAPU: { code: 'FAPU', label: 'Mehrfach ungesättigte Fettsäuren', unit: 'g', group: 'fatty_acid', order: 3 },
  FAPUN3: { code: 'FAPUN3', label: 'Omega-3-Fettsäuren gesamt', shortLabel: 'Omega-3', unit: 'g', group: 'fatty_acid', order: 4 },
  'F18:3CN3': { code: 'F18:3CN3', label: 'Alpha-Linolensäure (ALA)', shortLabel: 'ALA', unit: 'g', group: 'fatty_acid', order: 5 },
  'F20:5CN3': { code: 'F20:5CN3', label: 'Eicosapentaensäure (EPA)', shortLabel: 'EPA', unit: 'g', group: 'fatty_acid', order: 6 },
  'F22:6CN3': { code: 'F22:6CN3', label: 'Docosahexaensäure (DHA)', shortLabel: 'DHA', unit: 'g', group: 'fatty_acid', order: 7 },
  FAPUN6: { code: 'FAPUN6', label: 'Omega-6-Fettsäuren gesamt', shortLabel: 'Omega-6', unit: 'g', group: 'fatty_acid', order: 8 },
  'F18:2CN6': { code: 'F18:2CN6', label: 'Linolsäure', unit: 'g', group: 'fatty_acid', order: 9 },
  'F20:4CN6': { code: 'F20:4CN6', label: 'Arachidonsäure', unit: 'g', group: 'fatty_acid', order: 10 },
  CHORL: { code: 'CHORL', label: 'Cholesterin', unit: 'mg', group: 'fatty_acid', order: 11 },
  VITA: { code: 'VITA', label: 'Vitamin A (Retinol-Äquivalent)', shortLabel: 'Vitamin A', unit: 'µg', group: 'vitamin_fat_soluble', order: 1 },
  CARTB: { code: 'CARTB', label: 'Beta-Carotin', unit: 'µg', group: 'vitamin_fat_soluble', order: 2 },
  VITD: { code: 'VITD', label: 'Vitamin D', unit: 'µg', group: 'vitamin_fat_soluble', order: 3 },
  VITE: { code: 'VITE', label: 'Vitamin E', unit: 'mg', group: 'vitamin_fat_soluble', order: 4 },
  VITK: { code: 'VITK', label: 'Vitamin K', unit: 'µg', group: 'vitamin_fat_soluble', order: 5 },
  THIA: { code: 'THIA', label: 'Vitamin B1 (Thiamin)', shortLabel: 'B1', unit: 'mg', group: 'vitamin_water_soluble', order: 1 },
  RIBF: { code: 'RIBF', label: 'Vitamin B2 (Riboflavin)', shortLabel: 'B2', unit: 'mg', group: 'vitamin_water_soluble', order: 2 },
  NIAEQ: { code: 'NIAEQ', label: 'Niacin-Äquivalent (B3)', shortLabel: 'B3', unit: 'mg', group: 'vitamin_water_soluble', order: 3 },
  PANTAC: { code: 'PANTAC', label: 'Pantothensäure (B5)', shortLabel: 'B5', unit: 'mg', group: 'vitamin_water_soluble', order: 4 },
  VITB6: { code: 'VITB6', label: 'Vitamin B6', shortLabel: 'B6', unit: 'µg', group: 'vitamin_water_soluble', order: 5 },
  BIOT: { code: 'BIOT', label: 'Biotin (B7)', shortLabel: 'B7', unit: 'µg', group: 'vitamin_water_soluble', order: 6 },
  FOL: { code: 'FOL', label: 'Folat-Äquivalent (B9)', shortLabel: 'Folat', unit: 'µg', group: 'vitamin_water_soluble', order: 7 },
  VITB12: { code: 'VITB12', label: 'Vitamin B12', shortLabel: 'B12', unit: 'µg', group: 'vitamin_water_soluble', order: 8 },
  VITC: { code: 'VITC', label: 'Vitamin C', unit: 'mg', group: 'vitamin_water_soluble', order: 9 },
  NA: { code: 'NA', label: 'Natrium', unit: 'mg', group: 'mineral', order: 1 },
  NACL: { code: 'NACL', label: 'Salz', unit: 'g', group: 'mineral', order: 2 },
  K: { code: 'K', label: 'Kalium', unit: 'mg', group: 'mineral', order: 3 },
  CA: { code: 'CA', label: 'Calcium', unit: 'mg', group: 'mineral', order: 4 },
  MG: { code: 'MG', label: 'Magnesium', unit: 'mg', group: 'mineral', order: 5 },
  P: { code: 'P', label: 'Phosphor', unit: 'mg', group: 'mineral', order: 6 },
  FE: { code: 'FE', label: 'Eisen', unit: 'mg', group: 'mineral', order: 7 },
  ZN: { code: 'ZN', label: 'Zink', unit: 'mg', group: 'mineral', order: 8 },
  ID: { code: 'ID', label: 'Jod', unit: 'µg', group: 'mineral', order: 9 },
  CU: { code: 'CU', label: 'Kupfer', unit: 'µg', group: 'mineral', order: 10 },
  MN: { code: 'MN', label: 'Mangan', unit: 'µg', group: 'mineral', order: 11 },
  FD: { code: 'FD', label: 'Fluorid', unit: 'µg', group: 'mineral', order: 12 },
  CR: { code: 'CR', label: 'Chrom', unit: 'µg', group: 'mineral', order: 13 },
  MO: { code: 'MO', label: 'Molybdän', unit: 'µg', group: 'mineral', order: 14 },
};

export const NUTRIENT_GROUP_LABELS: Record<NutrientGroup, string> = {
  energy: 'Energie',
  macro: 'Makronährstoffe',
  fatty_acid: 'Fettsäuren',
  vitamin_fat_soluble: 'Fettlösliche Vitamine',
  vitamin_water_soluble: 'Wasserlösliche Vitamine',
  mineral: 'Mineralstoffe & Spurenelemente',
};

/**
 * Nährwerte pro 100 g. `null` = im BLS kein verlässlicher Wert vorhanden
 * (BLS-Doku: „fehlender Wert ≠ 0“). Wird bei Summen als „unvollständig“ geführt.
 */
export type NutrientValues = Partial<Record<NutrientCode, number | null>>;

/** Ergebnis einer Nährwertberechnung mit Vollständigkeitsinformation. */
export interface NutrientTotals {
  values: Record<NutrientCode, number>;
  /**
   * Pro Nährstoff: wie viele Gramm der Gesamtmenge KEINEN Wert hatten.
   * 0 = vollständig. Damit lässt sich „unvollständig“ ehrlich anzeigen.
   */
  missingGrams: Record<NutrientCode, number>;
  /** Gesamtgramm, die in die Berechnung eingeflossen sind */
  totalGrams: number;
  /** Anzahl Zutaten ohne BLS-Zuordnung (fließen gar nicht ein) */
  unmappedIngredients: number;
}

export type DataQuality = 'bls_calculated' | 'incomplete' | 'development_placeholder' | 'unavailable';
