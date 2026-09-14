/**
 * Parser für die BLS-4.0-Excel-Datei (Max Rubner-Institut, CC BY 4.0).
 *
 * Aufbau laut BLS-Dokumentation:
 *   Spalte A: BLS Code, B: Lebensmittelbezeichnung (de), C: Food name (en)
 *   danach je Nährstoff 3 Spalten: Wert | Datenherkunft | Referenz
 * Fehlende Werte: "-" bzw. leer  → null   (≠ 0 !)
 * Spuren:         "TR"           → 0      (nachgewiesen, nicht quantifizierbar)
 * "<LOQ"/"<LOD":                 → 0      (unterhalb Nachweisgrenze)
 *
 * Der Parser sucht die Kopfzeile selbst und erkennt Nährstoffspalten am
 * Code (z. B. "ENERCC", auch wenn der Header "ENERCC [kcal]" o. Ä. lautet).
 */
import * as XLSX from 'xlsx';

export const ALL_BLS_CODES = [
  'ENERCJ','ENERCC','WATER','PROT625','FAT','CHO','FIBT','ALC','OA','ASH','POLYL',
  'GLUS','FRUS','GALS','MNSAC','SUCS','MALS','LACS','DISAC','SUGAR','OLSAC','STARCH',
  'FIBLMW','FIBHMW','FIBINS','FIBSOL','FIBHMWS','FIBHMWI',
  'FASAT','F4:0','F6:0','F8:0','F10:0','F12:0','F14:0','F15:0','F16:0','F17:0','F18:0','F20:0','F22:0','F24:0',
  'FAMS','F14:1CN5','F16:1CN7','F18:1CN7','F18:1CN9','F20:1CN9','F22:1CN9',
  'FAPU','FAPUN3','FAPUN6','F18:2CN6','F18:2C9T11','F18:3CN3','F18:3CN6','F18:4CN3','F20:2CN6','F20:3CN6','F20:4CN6','F20:5CN3','F22:5CN3','F22:6CN3','FAX',
  'AAE9','ILE','LEU','LYS','MET','PHE','THR','TRP','VAL','HIS','ALA','ARG','ASP','GLU','GLY','PRO','SER','TYR','CYSTE',
  'VITA','VITAA','RETOL','CARTB','CAROTPAXB','VITD','ERGCAL','CHOCAL',
  'VITE','TOCPHA','TOCPHB','TOCPHG','TOCPHD','TOCTRA','VITK','VITK1','VITK2',
  'THIA','RIBF','NIA','NIAEQ','PANTAC','VITB6','BIOT','FOL','FOLFD','FOLAC','VITB12','VITC',
  'NACL','NA','CLD','K','CA','MG','P','S','FE','ZN','ID','CU','MN','FD','CR','MO',
  'ACEAC','CITAC','LACAC','MALAC','TARAC','MANTL','SORTL','XYLTL','CHORL','NT',
] as const;

export interface BlsFoodRow {
  blsCode: string;
  nameDe: string;
  nameEn: string | null;
  nutrients: Record<string, number>; // nur vorhandene Werte; fehlende Codes = kein Wert
}

export interface ParseResult {
  rows: BlsFoodRow[];
  columnsFound: string[];
  columnsMissing: string[];
  sheetName: string;
  headerRowIndex: number;
}

const CODE_SET = new Set<string>(ALL_BLS_CODES);

export function parseNutrientCell(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const s = String(raw).trim();
  if (s === '' || s === '-' || s === '–' || s.toLowerCase() === 'na' || s.toLowerCase() === 'n/a') return null;
  if (/^tr$/i.test(s) || /^<\s*(loq|lod)/i.test(s) || s.toLowerCase() === 'spuren') return 0;
  const n = Number(s.replace(',', '.').replace(/[^\d.\-eE]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/**
 * Erkennt die WERT-Spalte eines Nährstoffs. Header in der BLS-4.0-Datei lauten z. B.
 * "ENERCC Energie (Kilokalorien) [kcal/100g]", "ENERCC Datenherkunft", "ENERCC Referenz".
 * Nur die erste Form liefert den Code zurück; Herkunft/Referenz-Spalten werden ignoriert.
 */
function normalizeHeader(h: unknown): string {
  const raw = String(h ?? '').trim();
  if (!raw) return '';
  if (/(datenherkunft|referenz|data origin|reference)\s*$/i.test(raw)) return '';
  const first = raw.split(/\s+/)[0] ?? '';
  return first.toUpperCase();
}

export function parseBlsWorkbook(buffer: Buffer | ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: buffer instanceof ArrayBuffer ? 'array' : 'buffer' });
  // Größtes Sheet = Datensheet
  let best: { name: string; rows: unknown[][] } | null = null;
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, raw: true, defval: null });
    if (!best || rows.length > best.rows.length) best = { name, rows };
  }
  if (!best) throw new Error('Keine Tabellenblätter gefunden.');

  // Kopfzeile finden: enthält viele bekannte Codes
  let headerRowIndex = -1;
  let headerMap: Map<number, string> = new Map();
  for (let i = 0; i < Math.min(best.rows.length, 30); i++) {
    const row = best.rows[i] ?? [];
    const map = new Map<number, string>();
    row.forEach((cell, idx) => {
      const h = normalizeHeader(cell);
      if (CODE_SET.has(h) && ![...map.values()].includes(h)) map.set(idx, h);
    });
    if (map.size > headerMap.size) {
      headerMap = map;
      headerRowIndex = i;
    }
    if (map.size >= 100) break;
  }
  if (headerRowIndex < 0 || headerMap.size < 20) {
    throw new Error('Kopfzeile mit BLS-Nährstoffcodes nicht gefunden. Ist das die richtige Datei?');
  }

  const header = best.rows[headerRowIndex] ?? [];
  const codeCol = header.findIndex((h) => /bls[\s_-]*code/i.test(String(h ?? '')));
  const nameDeCol = header.findIndex((h) => /bezeichnung|lebensmittel(name)?$/i.test(String(h ?? '')));
  const nameEnCol = header.findIndex((h) => /food\s*name|english/i.test(String(h ?? '')));
  const cCode = codeCol >= 0 ? codeCol : 0;
  const cDe = nameDeCol >= 0 ? nameDeCol : 1;
  const cEn = nameEnCol >= 0 ? nameEnCol : 2;

  const rows: BlsFoodRow[] = [];
  for (let i = headerRowIndex + 1; i < best.rows.length; i++) {
    const row = best.rows[i];
    if (!row) continue;
    const code = String(row[cCode] ?? '').trim();
    if (!/^[A-Z][A-Z0-9]{6}$/.test(code)) continue; // Leerzeilen / Fußnoten überspringen (Codes wie C131000 oder X1A0000)
    const nutrients: Record<string, number> = {};
    for (const [idx, nutrientCode] of headerMap) {
      const v = parseNutrientCell(row[idx]);
      if (v !== null) nutrients[nutrientCode] = v;
    }
    rows.push({
      blsCode: code,
      nameDe: String(row[cDe] ?? '').trim(),
      nameEn: row[cEn] != null ? String(row[cEn]).trim() : null,
      nutrients,
    });
  }

  const found = [...headerMap.values()];
  return {
    rows,
    columnsFound: found,
    columnsMissing: ALL_BLS_CODES.filter((c) => !found.includes(c)),
    sheetName: best.name,
    headerRowIndex,
  };
}
