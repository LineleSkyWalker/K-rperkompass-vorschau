import * as XLSX from 'xlsx';
import { parseBlsWorkbook, parseNutrientCell } from '../lib/bls';

describe('parseNutrientCell', () => {
  it('unterscheidet fehlend (null) von Spuren/0', () => {
    expect(parseNutrientCell(null)).toBeNull();
    expect(parseNutrientCell('')).toBeNull();
    expect(parseNutrientCell('-')).toBeNull();
    expect(parseNutrientCell('TR')).toBe(0);
    expect(parseNutrientCell('<LOQ')).toBe(0);
    expect(parseNutrientCell(0)).toBe(0);
    expect(parseNutrientCell('12,5')).toBe(12.5);
    expect(parseNutrientCell(3.2)).toBe(3.2);
  });
});

describe('parseBlsWorkbook', () => {
  it('erkennt Kopfzeile, Codes und Werte-/Herkunfts-/Referenzspalten', () => {
    const header = ['BLS Code', 'Lebensmittelbezeichnung', 'Food name'];
    const codes = ['ENERCC', 'PROT625', 'FAT', 'CHO', 'FIBT', 'FAPUN3', 'FAPUN6', 'VITC', 'CA', 'FE'];
    // reichlich Codes, damit die Heuristik (>=20) greift
    const more = ['ENERCJ','WATER','SUGAR','FASAT','FAMS','FAPU','F18:3CN3','F20:5CN3','F22:6CN3','F18:2CN6','VITA','VITD','VITE','VITK','THIA','RIBF','VITB12','FOL','NA','K','MG','ZN','ID'];
    for (const c of [...codes, ...more]) header.push(`${c} [Einheit]`, `${c} Datenherkunft`, `${c} Referenz`);
    const row1: (string | number)[] = ['C131000', 'Hafer, Flocken', 'Oats, flakes'];
    const row2: (string | number)[] = ['G100000', 'Tomate, frisch', 'Tomato'];
    for (const c of [...codes, ...more]) {
      row1.push(c === 'ENERCC' ? 370 : c === 'FAPUN3' ? 'TR' : 1.5, 'analysiert', 'Ref');
      row2.push(c === 'ENERCC' ? 18 : c === 'FAPUN3' ? '-' : 0.2, 'berechnet', 'Ref');
    }
    const ws = XLSX.utils.aoa_to_sheet([['Bundeslebensmittelschlüssel 4.0'], [], header, row1, row2, ['Fußnote']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daten');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

    const res = parseBlsWorkbook(buf);
    expect(res.headerRowIndex).toBe(2);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]!.blsCode).toBe('C131000');
    expect(res.rows[0]!.nameDe).toBe('Hafer, Flocken');
    expect(res.rows[0]!.nutrients.ENERCC).toBe(370);
    expect(res.rows[0]!.nutrients.FAPUN3).toBe(0); // Spuren
    expect(res.rows[1]!.nutrients.FAPUN3).toBeUndefined(); // fehlend → nicht gesetzt
    expect(res.rows[1]!.nutrients.ENERCC).toBe(18);
    expect(res.columnsFound).toContain('F20:5CN3');
  });
});
