/**
 * Build-time SEO guard.
 *
 * Catches the class of bug that is invisible in a browser but wrong for search
 * engines. Written after shipping a build where every canonical pointed at
 * `/units.html` while the sitemap listed `/units` and Vercel served `/units` —
 * three different answers to "what is this page's URL".
 *
 * Run: npm run audit:seo
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
/**
 * Read the origin from the data layer rather than repeating it here.
 *
 * This was hardcoded when the script was copied over, so it kept checking every
 * canonical against the previous site's domain and failed all ten pages. A guard
 * that has to be edited per project is a guard that eventually lies.
 */
const ORIGIN = readFileSync(join('src', 'data', 'site.ts'), 'utf8').match(
  /url:\s*'([^']+)'/,
)?.[1];

if (!ORIGIN) {
  console.error('✗ Could not read SITE.url from src/data/site.ts.');
  process.exit(1);
}

/** Google truncates around here; not a hard failure, but worth knowing. */
const TITLE_MAX = 62;
const DESC_MIN = 70;
const DESC_MAX = 165;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const pick = (html, re) => (html.match(re)?.[1] ?? '').trim();

if (!existsSync(DIST)) {
  console.error('✗ No dist/. Run `npm run build` first.');
  process.exit(1);
}

const errors = [];
const warnings = [];

// ── Per-page checks ─────────────────────────────────────────────────────────
const pages = walk(DIST);
const titles = new Map();
const descs = new Map();
const canonicals = new Set();

for (const file of pages) {
  const rel = relative(DIST, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');

  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const ogUrl = pick(html, /property="og:url" content="([^"]*)"/);
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!title) errors.push(`${rel}: missing <title>`);
  if (!desc) errors.push(`${rel}: missing meta description`);

  // The bug this script exists for.
  if (canonical.endsWith('.html')) {
    errors.push(`${rel}: canonical ends in .html (${canonical}) — served URL is clean`);
  }
  if (canonical.includes('/index')) {
    errors.push(`${rel}: canonical contains /index (${canonical})`);
  }
  if (ogUrl && ogUrl !== canonical) {
    errors.push(`${rel}: og:url (${ogUrl}) does not match canonical (${canonical})`);
  }
  if (canonical && !canonical.startsWith(ORIGIN)) {
    errors.push(`${rel}: canonical is not on ${ORIGIN} (${canonical})`);
  }

  // Length only matters for pages that can appear in results at all.
  if (!noindex) {
    if (title.length > TITLE_MAX) {
      warnings.push(`${rel}: title is ${title.length} chars, truncates near ${TITLE_MAX}`);
    }
    if (desc && (desc.length < DESC_MIN || desc.length > DESC_MAX)) {
      warnings.push(`${rel}: description is ${desc.length} chars (aim ${DESC_MIN}–${DESC_MAX})`);
    }
  }

  const h1Count = (html.match(/<h1[\s>]/g) || []).length;
  if (h1Count !== 1) errors.push(`${rel}: ${h1Count} <h1> elements, expected exactly 1`);

  if (/<img(?![^>]*\balt=)/.test(html)) errors.push(`${rel}: an <img> is missing alt`);

  // Only index-eligible pages participate in duplicate + sitemap checks.
  if (!noindex) {
    titles.set(title, [...(titles.get(title) ?? []), rel]);
    descs.set(desc, [...(descs.get(desc) ?? []), rel]);
    canonicals.add(canonical);
  }
}

for (const [title, files] of titles) {
  if (files.length > 1) errors.push(`Duplicate title "${title}" on: ${files.join(', ')}`);
}
for (const [, files] of descs) {
  if (files.length > 1) errors.push(`Duplicate meta description on: ${files.join(', ')}`);
}

// ── Sitemap must agree with the canonicals ──────────────────────────────────
const sitemapFile = join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapFile)) {
  errors.push('sitemap-0.xml missing');
} else {
  const xml = readFileSync(sitemapFile, 'utf8');
  const locs = new Set(
    [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/\/$/, '') || ORIGIN),
  );
  const canon = new Set([...canonicals].map((c) => c.replace(/\/$/, '') || ORIGIN));

  for (const loc of locs) {
    if (!canon.has(loc)) errors.push(`Sitemap lists ${loc} but no page canonicalises to it`);
  }
  for (const c of canon) {
    if (!locs.has(c)) errors.push(`${c} is indexable but absent from the sitemap`);
  }
}

// ── robots.txt sanity ───────────────────────────────────────────────────────
const robots = join(DIST, 'robots.txt');
if (!existsSync(robots)) {
  errors.push('robots.txt missing');
} else {
  const txt = readFileSync(robots, 'utf8');
  if (!txt.includes('Sitemap:')) errors.push('robots.txt has no Sitemap: line');
  if (/^Disallow: \/$/m.test(txt)) errors.push('robots.txt disallows the entire site');
}

// ── Report ──────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✗ ${e}`);


/**
 * ── Cross-project origin leak ────────────────────────────────────────────────
 * These files are copied wholesale when a new site is started from an old one,
 * and a stale domain in them is silent: the pages all look right. robots.txt
 * pointed at the previous site's sitemap for the whole first build, which would
 * have told Google to crawl a sitemap on a domain we do not control.
 *
 * Anything that names an http(s) origin other than ORIGIN is flagged.
 */
{
  const host = new URL(ORIGIN).host;
  const bare = host.replace(/^www\./, '');
  for (const file of ['dist/robots.txt', 'vercel.json']) {
    if (!existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/https?:\/\/([a-z0-9.-]+\.[a-z]{2,})/gi)) {
      const found = m[1].toLowerCase();
      const ok =
        found === host ||
        found === bare ||
        found === `www.${bare}` ||
        found.endsWith('.vercel.sh') ||
        found.endsWith('.schema.org') ||
        found === 'schema.org';
      if (!ok) {
        errors.push(
          `${file}: references ${found}, which is not this site's origin ` +
            `(${bare}). Left over from another project?`,
        );
      }
    }
  }
}

if (errors.length) {
  console.error(`\n${errors.length} SEO error(s) across ${pages.length} pages.`);
  process.exit(1);
}
console.log(`✓ SEO OK — ${pages.length} pages, ${canonicals.size} indexable, ${warnings.length} warning(s)`);
