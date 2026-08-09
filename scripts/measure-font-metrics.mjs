/**
 * Measure the metric-matched fallback overrides for the site font.
 *
 * Why this exists: `font-display: swap` paints in a fallback face and then swaps to
 * the real one. If the two faces have different metrics, that swap reflows the page —
 * on the Cañon City build it was the entire mobile CLS (0.087). The fix is to stretch
 * the local fallback to the web font's proportions with ascent/descent/size-adjust
 * overrides. Those numbers have to be measured; guessing them can make things worse.
 *
 * Prints a ready-to-paste @font-face block for src/styles/global.css.
 *
 * Usage:  npm run measure:font        (dev server must be running)
 *         npm run measure:font -- http://localhost:4330
 *
 * Requires Playwright's chromium, which Astro does not depend on. If it is not
 * installed the script says so and exits 0 — this is a maintenance tool, not a
 * build gate, and it must never fail CI.
 */

const url = process.argv[2] ?? 'http://localhost:4330';

const TARGET_FAMILY = 'Outfit Variable';
const FALLBACK_FAMILY = 'Arial';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log(
    'measure:font — playwright is not installed.\n' +
      '  npm i -D playwright && npx playwright install chromium\n' +
      'Skipping (this is a maintenance tool, not a build gate).',
  );
  process.exit(0);
}

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 15_000 });
} catch (err) {
  console.error(`measure:font — could not reach ${url}. Is the dev server running?`);
  console.error(String(err.message ?? err));
  await browser.close();
  process.exit(1);
}

const result = await page.evaluate(
  async ([targetFamily, fallbackFamily]) => {
    await document.fonts.ready;
    await document.fonts.load(`400 100px "${targetFamily}"`);

    const ctx = document.createElement('canvas').getContext('2d');
    // Measuring at 1000px makes every result a per-em ratio directly.
    const SIZE = 1000;
    const sample =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789';

    const metrics = (family) => {
      ctx.font = `400 ${SIZE}px ${family}`;
      // 'Hxjgq' spans cap height through descender.
      const m = ctx.measureText('Hxjgq');
      return {
        ascent: m.fontBoundingBoxAscent / SIZE,
        descent: m.fontBoundingBoxDescent / SIZE,
        avgWidth: ctx.measureText(sample).width / SIZE / sample.length,
      };
    };

    const target = metrics(`"${targetFamily}"`);
    const fallback = metrics(fallbackFamily);

    return {
      target,
      fallback,
      /**
       * Guard against the failure that already bit once: if the web font did not
       * actually load, the canvas silently substitutes the fallback and both
       * measurements come back identical. The numbers look plausible and are wrong.
       */
      targetLoaded: Math.abs(target.avgWidth - fallback.avgWidth) > 1e-4,
    };
  },
  [TARGET_FAMILY, FALLBACK_FAMILY],
);

await browser.close();

if (!result.targetLoaded) {
  console.error(
    `measure:font — "${TARGET_FAMILY}" did not load on ${url}; it measured identically\n` +
      `to ${FALLBACK_FAMILY}. The output would be meaningless, so nothing was written.\n` +
      'Check the @font-face src path in src/styles/global.css.',
  );
  process.exit(1);
}

const sizeAdjust = result.target.avgWidth / result.fallback.avgWidth;
const pct = (n) => `${(n * 100).toFixed(2)}%`;

console.log(`Measured "${TARGET_FAMILY}" against local ${FALLBACK_FAMILY} on ${url}\n`);
console.log(`  ${TARGET_FAMILY}: ascent ${result.target.ascent}, descent ${result.target.descent}, avg advance ${result.target.avgWidth.toFixed(4)}`);
console.log(`  ${FALLBACK_FAMILY}: ascent ${result.fallback.ascent}, descent ${result.fallback.descent}, avg advance ${result.fallback.avgWidth.toFixed(4)}\n`);
console.log('Paste into src/styles/global.css:\n');
console.log(`@font-face {
  font-family: '${TARGET_FAMILY.split(' ')[0]} Fallback';
  src: local('${FALLBACK_FAMILY}');
  ascent-override: ${pct(result.target.ascent / sizeAdjust)};
  descent-override: ${pct(result.target.descent / sizeAdjust)};
  line-gap-override: 0%;
  size-adjust: ${pct(sizeAdjust)};
}`);
