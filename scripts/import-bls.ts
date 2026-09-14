/**
 * BLS-4.0-Import
 *
 *   npm run bls:import                 → schreibt data/bls/bls-4.0.json (lokaler Cache) UND nach Supabase
 *   npm run bls:import -- --local-only → nur lokaler Cache (kein Supabase nötig)
 *
 * Env: BLS_XLSX_PATH, SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Attribution: Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0.
 * Lizenz: CC BY 4.0. DOI: 10.25826/Data20251217-134202-0
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { parseBlsWorkbook } from './lib/bls';

const BLS_VERSION = '4.0';
const BLS_DOI = '10.25826/Data20251217-134202-0';
const ATTRIBUTION = 'Max Rubner-Institut (2025): Bundeslebensmittelschlüssel (BLS), Version 4.0';

async function main() {
  const localOnly = process.argv.includes('--local-only');
  const xlsxPath = process.env.BLS_XLSX_PATH ?? './data/bls/BLS_4_0_Daten_2025_DE.xlsx';
  if (!fs.existsSync(xlsxPath)) {
    console.error(`BLS-Datei nicht gefunden: ${xlsxPath}\nDownload: https://blsdb.de/download (ZIP entpacken, Pfad in BLS_XLSX_PATH setzen).`);
    process.exit(1);
  }
  console.log(`Lese ${xlsxPath} …`);
  const result = parseBlsWorkbook(fs.readFileSync(xlsxPath));
  console.log(`Sheet "${result.sheetName}", Kopfzeile ${result.headerRowIndex + 1}, ${result.rows.length} Lebensmittel, ${result.columnsFound.length} Nährstoffspalten erkannt.`);
  if (result.columnsMissing.length) {
    console.warn(`Nicht gefundene Codes (${result.columnsMissing.length}): ${result.columnsMissing.join(', ')}`);
  }

  // Lokaler Cache (für Mapping-Skripte und Entwicklung ohne Supabase)
  const outDir = path.resolve('data/bls');
  fs.mkdirSync(outDir, { recursive: true });
  const cachePath = path.join(outDir, 'bls-4.0.json');
  fs.writeFileSync(
    cachePath,
    JSON.stringify(
      {
        source: ATTRIBUTION,
        license: 'CC BY 4.0',
        doi: BLS_DOI,
        version: BLS_VERSION,
        importedAt: new Date().toISOString(),
        sourceFile: path.basename(xlsxPath),
        foods: result.rows,
      },
      null,
      0,
    ),
  );
  console.log(`Lokaler Cache geschrieben: ${cachePath}`);

  if (localOnly) return;

  const url = process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY werden für den Datenbank-Import benötigt (oder --local-only nutzen).');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: version, error: vErr } = await supabase
    .from('bls_import_version')
    .insert({
      source_version: BLS_VERSION,
      source_file: path.basename(xlsxPath),
      source_doi: BLS_DOI,
      license: 'CC BY 4.0',
      attribution: ATTRIBUTION,
      row_count: result.rows.length,
    })
    .select('id')
    .single();
  if (vErr || !version) throw vErr ?? new Error('Versionseintrag fehlgeschlagen');

  const BATCH = 500;
  for (let i = 0; i < result.rows.length; i += BATCH) {
    const chunk = result.rows.slice(i, i + BATCH).map((r) => ({
      bls_code: r.blsCode,
      name_de: r.nameDe,
      name_en: r.nameEn,
      nutrients: r.nutrients,
      import_version_id: version.id,
    }));
    const { error } = await supabase.from('bls_food').upsert(chunk, { onConflict: 'bls_code' });
    if (error) throw error;
    console.log(`  ${Math.min(i + BATCH, result.rows.length)} / ${result.rows.length}`);
  }
  console.log('Fertig. Bitte im Adminbereich die Zutaten-Zuordnungen prüfen (mapping_status = suggested).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
