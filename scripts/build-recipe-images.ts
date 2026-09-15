/**
 * Erzeugt data/recipe-images.ts aus scripts/image-picks.json.
 *
 * Quelle der Fotos: Wikimedia Commons (frei lizenziert: CC0 / CC BY / CC BY-SA /
 * gemeinfrei). Pro Rezept ist Dateiname, Lizenz und Urheber hinterlegt; die
 * Bild-URL wird deterministisch aus dem Dateinamen berechnet (Commons-Schema
 * mit MD5-Präfix). In der App wird ein 960px-Thumbnail geladen.
 *
 *   npx tsx scripts/build-recipe-images.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

type Pick = [file: string, license: string, artist: string];

const LICENSE_URLS: Record<string, string> = {
  CC0: 'https://creativecommons.org/publicdomain/zero/1.0/',
  'Public domain': 'https://commons.wikimedia.org/wiki/Commons:Licensing#Public_domain',
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 2.5': 'https://creativecommons.org/licenses/by-sa/2.5/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

function commonsUrls(file: string, width = 960) {
  const name = file.replace(/ /g, '_');
  const md5 = createHash('md5').update(name).digest('hex');
  const enc = encodeURIComponent(name).replace(/%2F/g, '/');
  const original = `https://upload.wikimedia.org/wikipedia/commons/${md5[0]}/${md5.slice(0, 2)}/${enc}`;
  // Bei sehr langen Dateinamen benennt Commons das Thumbnail schlicht "<width>px-thumbnail.<ext>"
  const ext = (name.split('.').pop() ?? 'jpg').toLowerCase();
  const thumbName = Buffer.byteLength(name, 'utf8') > 150 ? `${width}px-thumbnail.${ext === 'jpeg' ? 'jpg' : ext}` : `${width}px-${enc}`;
  const thumb = `https://upload.wikimedia.org/wikipedia/commons/thumb/${md5[0]}/${md5.slice(0, 2)}/${enc}/${thumbName}`;
  const page = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name)}`;
  return { original, thumb, page };
}

const picks = JSON.parse(fs.readFileSync(path.resolve('scripts/image-picks.json'), 'utf8')) as Record<string, Pick>;

const lines: string[] = [
  '/**',
  ' * Rezeptfotos von Wikimedia Commons (frei lizenziert) – AUTOMATISCH ERZEUGT',
  ' * aus scripts/image-picks.json via `npx tsx scripts/build-recipe-images.ts`.',
  ' * Nicht von Hand bearbeiten. Urheber und Lizenz werden in der App genannt',
  ' * (Rezeptdetail + Profil → Bildnachweise).',
  ' */',
  "import type { RecipeImage } from '../src/types/recipe';",
  '',
  'export const RECIPE_IMAGES: Record<string, RecipeImage> = {',
];
for (const [id, [file, license, artist]] of Object.entries(picks)) {
  const licenseUrl = LICENSE_URLS[license];
  if (!licenseUrl) throw new Error(`Unbekannte Lizenz "${license}" bei ${id}`);
  const { thumb, page } = commonsUrls(file);
  const attribution = `Foto: ${artist} · ${license} · Wikimedia Commons`;
  lines.push(
    `  ${JSON.stringify(id)}: { url: ${JSON.stringify(thumb)}, sourceType: 'licensed_photo', sourceName: 'Wikimedia Commons', license: ${JSON.stringify(license)}, attribution: ${JSON.stringify(attribution)}, sourceUrl: ${JSON.stringify(page)} },`,
  );
}
lines.push('};', '');
fs.writeFileSync(path.resolve('data/recipe-images.ts'), lines.join('\n'));
console.log(`Bilder: ${Object.keys(picks).length} → data/recipe-images.ts`);
