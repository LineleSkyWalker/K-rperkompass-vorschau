import { formatQuantity, toGrams } from '../units';

describe('toGrams', () => {
  it('konvertiert Masse-Einheiten', () => {
    expect(toGrams(200, 'g')).toBe(200);
    expect(toGrams(1.5, 'kg')).toBe(1500);
  });

  it('konvertiert Volumen mit Dichte', () => {
    expect(toGrams(100, 'ml')).toBe(100);
    expect(toGrams(100, 'ml', { densityGPerMl: 0.92 })).toBeCloseTo(92);
    expect(toGrams(0.5, 'l', { densityGPerMl: 1.03 })).toBeCloseTo(515);
  });

  it('nutzt zutatenspezifische Löffelgewichte', () => {
    expect(toGrams(2, 'EL')).toBe(30);
    expect(toGrams(2, 'EL', { gramsPerTablespoon: 10 })).toBe(20);
    expect(toGrams(1, 'TL', { gramsPerTeaspoon: 3 })).toBe(3);
  });

  it('konvertiert Stück nur mit bekanntem Stückgewicht – rät nie', () => {
    expect(toGrams(2, 'Stück', { gramsPerPiece: 55 })).toBe(110);
    expect(toGrams(2, 'Stück')).toBeNull();
    expect(toGrams(1, 'Packung')).toBeNull();
  });

  it('gibt null bei fehlender Menge/Einheit oder ungültigen Werten', () => {
    expect(toGrams(null, 'g')).toBeNull();
    expect(toGrams(5, null)).toBeNull();
    expect(toGrams(-1, 'g')).toBeNull();
    expect(toGrams(Number.NaN, 'g')).toBeNull();
  });
});

describe('formatQuantity', () => {
  it('rundet Gramm sinnvoll', () => {
    expect(formatQuantity(233.3, 'g')).toBe('235 g');
    expect(formatQuantity(47.6, 'g')).toBe('48 g');
    expect(formatQuantity(7.3, 'g')).toBe('7,5 g');
  });

  it('zeigt Brüche für Stück und Löffel', () => {
    expect(formatQuantity(0.5, 'Stück')).toBe('½ Stück');
    expect(formatQuantity(1.5, 'EL')).toBe('1 ½ EL');
    expect(formatQuantity(0.25, 'TL')).toBe('¼ TL');
    expect(formatQuantity(3, 'Stück')).toBe('3 Stück');
  });

  it('kommt ohne Einheit klar', () => {
    expect(formatQuantity(2, null)).toBe('2');
    expect(formatQuantity(null, null)).toBe('');
  });
});
