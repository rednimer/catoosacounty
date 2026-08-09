/**
 * Build-weight guard.
 *
 * Fails the build if an unoptimized original slips into dist. This catches the
 * specific trap where an image is imported in src/data/images.ts but never
 * rendered through <Image>, in which case Astro emits the full-size original
 * (we shipped a 3.2 MB JPEG this way once).
 *
 * Run: npm run audit:weight
 */
import { readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const DIST = 'dist';

/** Any single raster asset above this is assumed to be an unprocessed original. */
const MAX_IMAGE_BYTES = 500 * 1024;
/** Total page weight ceiling for the whole build. */
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;

const RASTER = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push({ path: full, size: statSync(full).size });
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch {
  console.error(`✗ No ${DIST}/ directory. Run \`npm run build\` first.`);
  process.exit(1);
}

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

const oversized = files
  .filter((f) => RASTER.has(extname(f.path).toLowerCase()))
  .filter((f) => f.size > MAX_IMAGE_BYTES)
  .sort((a, b) => b.size - a.size);

const total = files.reduce((sum, f) => sum + f.size, 0);

let failed = false;

if (oversized.length) {
  failed = true;
  console.error(`\n✗ ${oversized.length} image(s) over ${kb(MAX_IMAGE_BYTES)}:\n`);
  for (const f of oversized) {
    console.error(`    ${kb(f.size).padStart(10)}  ${relative(DIST, f.path)}`);
  }
  console.error(
    '\n  Likely cause: the image is imported in src/data/images.ts but never\n' +
      '  rendered through <Image>, so Astro emitted the original untouched.\n' +
      '  Either render it via <Image>, or remove the unused import.\n',
  );
}

/**
 * ── Unprocessed source images ────────────────────────────────────────────────
 * The size ceiling above is a blunt instrument and it missed the real failure.
 * A registered-but-unrendered PNG shipped at 265 kB — under the 500 kB limit, so
 * the audit passed it while the build carried a raw source file five times the
 * size of its optimised sibling.
 *
 * Everything routed through Astro's <Image> comes out as .webp or .avif, so any
 * .png/.jpg/.jpeg sitting in _astro/ has bypassed the pipeline by definition.
 * Flag it regardless of size.
 *
 * (Files in public/ are intentionally unprocessed and are not checked here.)
 */
const UNPROCESSED = new Set(['.png', '.jpg', '.jpeg']);
const unprocessed = files
  .filter((f) => relative(DIST, f.path).replace(/\\/g, '/').startsWith('_astro/'))
  .filter((f) => UNPROCESSED.has(extname(f.path).toLowerCase()))
  .sort((a, b) => b.size - a.size);

if (unprocessed.length) {
  failed = true;
  console.error(
    `\n✗ ${unprocessed.length} unoptimised source image(s) in _astro/ ` +
      '(everything through <Image> is .webp/.avif):\n',
  );
  for (const f of unprocessed) {
    console.error(`    ${kb(f.size).padStart(10)}  ${relative(DIST, f.path)}`);
  }
  console.error(
    '\n  A bare `import` in src/data/images.ts is enough to emit the original,\n' +
      '  even if no page ever renders it. Render it via <Image>, or drop the import.\n',
  );
}

if (total > MAX_TOTAL_BYTES) {
  failed = true;
  console.error(`✗ Total build ${mb(total)} exceeds ceiling ${mb(MAX_TOTAL_BYTES)}\n`);
}

if (failed) process.exit(1);

console.log(`✓ Build weight OK — ${mb(total)} across ${files.length} files`);
console.log(`  Largest image: ${kb(Math.max(...files.filter((f) => RASTER.has(extname(f.path).toLowerCase())).map((f) => f.size), 0))}`);
