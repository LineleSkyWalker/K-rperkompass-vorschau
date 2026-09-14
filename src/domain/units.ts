import type { Ingredient, Unit } from '@/types/recipe';

/** Standard-Gramm pro Löffel, wenn die Zutat nichts anderes definiert. */
export const DEFAULT_GRAMS_PER_TABLESPOON = 15;
export const DEFAULT_GRAMS_PER_TEASPOON = 5;
export const DEFAULT_GRAMS_PER_PINCH = 0.5;
export const DEFAULT_GRAMS_PER_CUP = 200;

export const MASS_UNITS: Unit[] = ['g', 'kg'];
export const VOLUME_UNITS: Unit[] = ['ml', 'l'];

export function isMassUnit(unit: Unit | null): boolean {
  return unit !== null && MASS_UNITS.includes(unit);
}
export function isVolumeUnit(unit: Unit | null): boolean {
  return unit !== null && VOLUME_UNITS.includes(unit);
}

/**
 * Rechnet eine Menge in Gramm um. Gibt `null` zurück, wenn keine
 * sinnvolle Umrechnung möglich ist (z. B. "1 Packung" ohne Gramm-Angabe).
 * Es wird NIE geraten – lieber null als ein falscher Wert.
 */
export function toGrams(
  quantity: number | null,
  unit: Unit | null,
  ingredient?: Pick<
    Ingredient,
    'gramsPerPiece' | 'gramsPerTablespoon' | 'gramsPerTeaspoon' | 'densityGPerMl'
  >,
): number | null {
  if (quantity === null || unit === null || !Number.isFinite(quantity) || quantity < 0) {
    return null;
  }
  switch (unit) {
    case 'g':
      return quantity;
    case 'kg':
      return quantity * 1000;
    case 'ml':
      return quantity * (ingredient?.densityGPerMl ?? 1);
    case 'l':
      return quantity * 1000 * (ingredient?.densityGPerMl ?? 1);
    case 'EL':
      return quantity * (ingredient?.gramsPerTablespoon ?? DEFAULT_GRAMS_PER_TABLESPOON);
    case 'TL':
      return quantity * (ingredient?.gramsPerTeaspoon ?? DEFAULT_GRAMS_PER_TEASPOON);
    case 'Prise':
      return quantity * DEFAULT_GRAMS_PER_PINCH;
    case 'Tasse':
      return quantity * DEFAULT_GRAMS_PER_CUP;
    case 'Stück':
    case 'Zehe':
    case 'Scheibe':
    case 'Bund':
    case 'Dose':
    case 'Packung':
      return ingredient?.gramsPerPiece != null ? quantity * ingredient.gramsPerPiece : null;
    default:
      return null;
  }
}

/**
 * Formatiert eine Menge lesbar (deutsches Zahlenformat, sinnvolle Rundung).
 * 0.5 → "½", 0.25 → "¼", 0.75 → "¾", 1.5 → "1 ½", 233.3 g → "235 g"
 */
export function formatQuantity(quantity: number | null, unit: Unit | null): string {
  if (quantity === null) return unit ?? '';
  const q = roundForDisplay(quantity, unit);
  const numberText =
    unit === 'g' || unit === 'ml' || unit === 'kg' || unit === 'l'
      ? String(q).replace('.', ',')
      : toFractionText(q);
  if (!unit) return numberText;
  return `${numberText} ${unit}`;
}

function roundForDisplay(q: number, unit: Unit | null): number {
  if (unit === 'g' || unit === 'ml') {
    if (q >= 100) return Math.round(q / 5) * 5;
    if (q >= 20) return Math.round(q);
    return Math.round(q * 2) / 2;
  }
  if (unit === 'kg' || unit === 'l') return Math.round(q * 100) / 100;
  // Stück, EL, TL, ...: auf Viertel runden
  return Math.round(q * 4) / 4;
}

function toFractionText(q: number): string {
  const whole = Math.floor(q);
  const frac = Math.round((q - whole) * 100) / 100;
  const fracMap: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };
  const fracText = fracMap[String(frac)];
  if (fracText) return whole === 0 ? fracText : `${whole} ${fracText}`;
  if (frac === 0) return String(whole);
  return String(q).replace('.', ',');
}
