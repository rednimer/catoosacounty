/**
 * Reserve-form build guard.
 *
 * The form posts straight to Web3Forms from the browser, and the access key is
 * baked into the HTML at build time. That makes one failure mode invisible: if
 * WEB3FORMS_ACCESS_KEY is missing from the build environment, the page renders
 * perfectly and every submission fails. Nobody notices until a customer does.
 *
 * This fails the build instead.
 *
 * Run: npm run audit:form
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FILE = join('dist', 'reserve.html');
const errors = [];
const warnings = [];

if (!existsSync(FILE)) {
  console.error('✗ dist/reserve.html not found. Run `npm run build` first.');
  process.exit(1);
}

const html = readFileSync(FILE, 'utf8');
const attr = (name, re) => html.match(re)?.[1] ?? null;

// ── The key ─────────────────────────────────────────────────────────────────
// Astro renders an empty string as a BARE `value` attribute, not value="" —
// so match the optional form or an unset key reads as "field missing".
const keyMatch = html.match(/name="access_key"(?:\s+value(?:="([^"]*)")?)?/);
const accessKey = keyMatch ? (keyMatch[1] ?? '') : null;

if (accessKey === null) {
  errors.push('No access_key field in the form at all.');
} else if (!accessKey.trim()) {
  errors.push(
    'access_key is EMPTY. WEB3FORMS_ACCESS_KEY was not present at build time, ' +
      'so the form renders fine and every submission will fail silently. ' +
      'Set it in the Vercel project (all environments you build in) and redeploy.',
  );
} else if (!/^[0-9a-f-]{30,}$/i.test(accessKey)) {
  warnings.push(`access_key does not look like a Web3Forms UUID: "${accessKey.slice(0, 12)}…"`);
}

// ── Where it posts ──────────────────────────────────────────────────────────
const action = attr('action', /<form[^>]*\saction="([^"]*)"/);
if (action !== 'https://api.web3forms.com/submit') {
  errors.push(`Form action is "${action}", expected https://api.web3forms.com/submit`);
}

// ── The no-JavaScript path ──────────────────────────────────────────────────
const redirect = attr('redirect', /name="redirect"\s+value="([^"]*)"/);
if (!redirect) {
  errors.push('No `redirect` field — visitors without JavaScript would land on a Web3Forms page.');
} else if (!redirect.includes('/reserve/thank-you')) {
  errors.push(`\`redirect\` points at "${redirect}", expected our /reserve/thank-you page.`);
}

// ── Spam trap ───────────────────────────────────────────────────────────────
if (!/name="botcheck"/.test(html)) {
  errors.push('The botcheck honeypot is missing — it is the only bot filter left on our side.');
} else if (!/name="botcheck"[^>]*(display:none|class="hidden")/.test(html)) {
  errors.push('botcheck is present but not hidden — real people would see and could tick it.');
}

// ── Fields the office needs ─────────────────────────────────────────────────
// Web3Forms labels each row in the email with the field's `name`, so these are
// both the payload contract and what the office actually reads.
for (const field of ['Name', 'Phone', 'email', 'Unit size', 'Move-in date', 'Message']) {
  if (!new RegExp(`name="${field}"`).test(html)) {
    errors.push(`Missing form field: ${field}`);
  }
}

// `email` (lowercase) is what Web3Forms uses for Reply-To.
if (!/name="email"/.test(html)) {
  errors.push('No lowercase `email` field — Reply-To will not point back at the customer.');
}

// ── Accessibility wiring that a redesign could quietly drop ─────────────────
for (const id of ['name-error', 'phone-error', 'email-error']) {
  if (!html.includes(`id="${id}"`)) errors.push(`Missing error region: ${id}`);
  else if (!new RegExp(`id="${id}"[^>]*role="alert"`).test(html)) {
    errors.push(`${id} exists but has no role="alert" — errors would be silent to screen readers.`);
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`⚠ ${w}`);
for (const e of errors) console.error(`✗ ${e}`);

/**
 * Missing-key handling differs by environment, on purpose.
 *
 * A missing WEB3FORMS_ACCESS_KEY must NEVER reach production: the page renders
 * perfectly and every submission vanishes, so nobody finds out until a customer
 * does. That is the whole reason this guard sits in Vercel's buildCommand.
 *
 * But it must not block a PREVIEW deploy either, or the site cannot be reviewed
 * before the key exists — which is exactly the state a rebuild starts in. On
 * preview a missing key degrades to a loud warning. Every other error (a dropped
 * field, a missing role="alert", a broken action URL) still fails everywhere,
 * because those are defects rather than pending configuration.
 */
const isPreview = process.env.VERCEL_ENV === 'preview';
const keyOnly = errors.length === 1 && /access_key is EMPTY/.test(errors[0]);

if (errors.length && isPreview && keyOnly) {
  console.warn(
    '\n⚠ PREVIEW BUILD: the reserve form has no access key, so submissions ' +
      'on this URL will NOT be delivered. Set WEB3FORMS_ACCESS_KEY before ' +
      'promoting to production — this same check fails the build there.',
  );
} else if (errors.length) {
  console.error(`\n${errors.length} problem(s) with the reserve form.`);
  process.exit(1);
} else {
  // Only claim the form is OK when it actually is. Printing the success line
  // unconditionally meant the preview path warned that the key was missing and
  // then immediately reported "key present ()" on the next line.
  console.log(
    `✓ Reserve form OK — key present (${accessKey.slice(0, 8)}…), posts to Web3Forms, ` +
      `no-JS redirect set, honeypot hidden, ${warnings.length} warning(s)`,
  );
}
