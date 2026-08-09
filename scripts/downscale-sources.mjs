/**
 * One-time source downscaler.
 *
 * The recovered originals are 4288x2848 (2.5–3.4 MB). Astro emits the source's
 * full width as the <img src> fallback, so a 477 kB variant was shipping even
 * though nothing renders wider than ~1040 px.
 *
 * This caps the working copies in src/assets at MAX_WIDTH. The untouched
 * originals stay archived in _source/images/ — this is not destructive to them.
 *
 * Run: node scripts/downscale-sources.mjs
 */
import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIR = 'src/assets';
const MAX_WIDTH = 2048;

const files = readdirSync(DIR).filter((f) =>
  ['.jpg', '.jpeg', '.png'].includes(extname(f).toLowerCase()),
);

for (const file of files) {
  const path = join(DIR, file);
  const before = statSync(path).size;
  // Read into a buffer first: on Windows sharp keeps a handle on a file path
  // input, which blocks writing back to that same path.
  const image = sharp(readFileSync(path));
  const { width, height } = await image.metadata();

  if (width <= MAX_WIDTH) {
    console.log(`· ${file} — ${width}px, already within ${MAX_WIDTH}px, skipped`);
    continue;
  }

  const isPng = extname(file).toLowerCase() === '.png';
  const buffer = await image
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .toFormat(isPng ? 'png' : 'jpeg', isPng ? { compressionLevel: 9 } : { quality: 88, mozjpeg: true })
    .toBuffer();

  writeFileSync(path, buffer);

  const after = statSync(path).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(
    `✓ ${file} — ${width}x${height} → ${MAX_WIDTH}px, ` +
      `${(before / 1024).toFixed(0)} kB → ${(after / 1024).toFixed(0)} kB (−${pct}%)`,
  );
}
