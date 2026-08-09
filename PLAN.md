# Catoosa County Storage — Rebuild Plan

**Stack:** Astro 7 + Tailwind v4, static output · **Deploy:** GitHub → Vercel
**Art direction:** CLIMATE CLEAR · **Leads:** own form; U-Haul kept for existing-customer payments
**Started:** 2026-08-09, from the Cañon City build as the technical foundation

---

## Phase 0 — Blockers (owner input)

Everything below is built and passing. These are the only things stopping launch.

### Must have before the site goes live

1. **Web3Forms access key** — create a **new** one bound to `catoosacountystorage.com`
   and set `WEB3FORMS_ACCESS_KEY` in the Vercel project. Do **not** reuse the Cañon
   City key; a Web3Forms key delivers to exactly one inbox. `npm run verify` fails
   today purely on this, by design — a missing key renders a perfect-looking form
   where every submission vanishes.
2. **Where should leads go** — which inbox? More than one? SMS as well?
3. **ZIP code** — the live payments page says **30742**, every directory says
   **30741**. Built as 30741. A wrong ZIP in schema and on Google Business Profile
   suppresses local ranking, so this needs a definite answer.
4. **Hours** — office and gate, exactly. Nothing is published today and the site says
   "Call for current office and gate hours" rather than guessing. Never 24/7 unless
   verified. Set `HOURS.published = true` in `src/data/site.ts` once confirmed.

### Needed to finish the content

5. **Which unit sizes actually exist**, and in which type (climate / drive-up).
   The size ladder in `src/data/units.ts` is the industry standard, flagged
   `CATALOGUE_PROVISIONAL = true`, and every size table renders a visible
   "call to confirm" note until that flips.
6. **Rates** — one "starting at" price per size, split by type. Prices are `null`
   today and degrade honestly to "Call for pricing".
7. **The `[GAP]` amenity list** — gated access, cameras, lighting, individually
   locked units, month-to-month terms, deposits, insurance, locks, minimum term,
   RV/boat/vehicle storage. See `_source/CONTENT-SOURCE.md` §7. The May build
   asserted all of these with no source; none of them are on the site.
8. **Geo coordinates** — verify against the parcel. Currently `null`, and both the
   schema and the geo meta tags omit themselves rather than publish a guess.
9. **Photographs** — there are none at all, and this is the biggest remaining gap.
   Priority order: the office and the turn off Mack Smith Road, the gate, a
   climate-controlled hallway, a drive-up unit with the door open, signage from
   Cloud Springs Road.
10. **Google Business Profile** — access, current review count and rating, and a
    decision on the name. Yelp/YellowPages/CMac all list
    "Catoosa County Climate Controlled & Self Storage"; the site uses
    "Catoosa County Storage" with the longer name as schema `alternateName`.
    Pick one and make the listings match byte for byte.

---

## Phase 1 — Foundation ✅ COMPLETE (2026-08-09)

- Astro 7 + Tailwind v4, TypeScript strict. `npm run check` → 0 errors.
- `src/data/site.ts` — NAP, hours, features, service area. Single source.
- `src/data/units.ts` — sizes, "what fits" copy, prices. One file for rates.
- Reusable components, layout, audit scripts and `vercel.json` carried over from
  Cañon City per the playbook.
- Old static site preserved at `_source/old-site/`; old repo history retained.

## Phase 2 — Brand ✅ COMPLETE (2026-08-09)

Art direction **CLIMATE CLEAR**, from the Higgsfield exploration (one of four;
the others were WAYFINDING, GEORGIA WARM and STEEL & SIGNAL).

| Token | Value | Role |
|---|---|---|
| `brand-800` | `#0E3A5C` | deep navy — headings, dark panels, footer |
| `accent-500` | `#2E9BC9` | bright cyan — CTAs, accents |
| `brand-100` | `#EAF3F8` | pale ice — tinted sections |
| `ink-500` | `#6B7A85` | cool gray — borders, muted UI |

- **Type:** Outfit Variable (geometric, wide tracking on display), latin subset,
  32 kB. Fallback metrics **measured**, not guessed — `npm run measure:font`.
- **Texture:** `.frost-field` — condensation droplets, frosted-glass hatch and a
  temperature gradient, all in CSS. Zero image requests.
- **Deliberately different from Cañon City:** bright hero instead of a dark slab,
  navy/cyan instead of red/slate, geometric instead of Inter, softer radii.

**Contrast rules that must not be broken** (documented in `global.css`):
`accent-500` is 3.16:1 on white — fills and large display only. The CTA works
because its label is `brand-950` at 4.92:1; white on cyan would fail. `ink-500`
is 4.44:1 — borders and large text only, never body copy.

## Phase 3 — Pages ✅ COMPLETE (2026-08-09)

10 routes: `/`, `/units`, `/climate-controlled-storage`,
`/storage-unit-size-guide`, `/location`, `/reserve`, `/reserve/thank-you`,
`/contact`, `/faq`, `/404`.

Climate control leads the whole site — it is the one verified differentiator and
what the directory listings put in the legal name.

**Verified 2026-08-09** across 10 pages × 4 widths (375 / 768 / 1280 / 1440), 40
combinations: zero contrast failures, zero horizontal overflow, exactly one `h1`
per page, no heading-level skips. Build 0.29 MB. `audit:weight` and `audit:seo`
both clean.

### Defects found and fixed during the build

| Found | Fix |
|---|---|
| `robots.txt` pointed at `canoncityselfstorage.com/sitemap-index.xml` | Rewritten — and `audit-seo` now fails on any foreign origin in `robots.txt` or `vercel.json`. Guard verified by deliberately breaking it. |
| `vercel.json` redirected `www.canoncityselfstorage.com` | Rewritten for this domain, plus 301s from the old `/index.php/*` WordPress slugs |
| Reserve form's notification subject read "canoncityselfstorage.com" | Every lead email would have been mislabelled |
| `audit-seo.mjs` had the origin hardcoded | Reads `SITE.url` now; it was failing all 10 pages |
| Footer, reserve and thank-you hardcoded Cañon City's hours | Now render from `HOURS` or show the fallback |
| Form errors styled with `brand` | `brand` is navy here, so errors rendered as ordinary text. Added a `danger` token. |
| `ink-500` body text measured 4.42:1 | Moved to `ink-600` (6.12:1) |
| Breadcrumb separator 3.30:1 on navy | Moved to `ink-400` (5.79:1) |
| First font measurement ran against Cañon City's dev server on port 4321 | Catoosa moved to 4330; the measure script now refuses to emit numbers if the web font did not actually load |

---

## Phase 4 — Launch (not started)

1. Set `WEB3FORMS_ACCESS_KEY` in Vercel, redeploy (env vars bind at deploy time).
2. Point the domain at Vercel. Pick apex or www and make everything agree —
   redirect, `SITE.url`, canonicals, sitemap, robots.txt, schema.
3. **Submit the real form end to end.** Unit tests do not catch the failure mode;
   only a browser submission does.
4. Lighthouse mobile on every page, 3 runs, take the median. Discard the first run
   after a deploy — cold edge cache.
5. Tab through every page once (press Tab first, or `:focus-visible` will not match).

### The old site

`catoosacountystorage.com` is a compromised WordPress install serving injected
casino spam — 77 instances of "casino" in a 79 KB homepage. Owner decision
2026-08-09: do not remediate it, replace and cut over.

Consequences worth acting on at launch:

- Check Search Console for a **manual action** and for indexed spam URLs before
  treating any existing ranking as an asset.
- The `/index.php/:path*` catch-all redirect is in `vercel.json` partly for this —
  it funnels the spam URLs to the homepage rather than leaving them to 404.
- Consider a temporary `noindex` sweep or a URL-removal request for the spam URLs.

---

## Post-launch

- Search Console, GA4, Google Business Profile NAP alignment (byte-identical).
- Add the city pages the May build had the right instinct about:
  `/rossville-storage` and `/fort-oglethorpe-storage`. Both are real high-intent
  queries; they were left out of this pass because there is not yet enough
  verified content to make them more than keyword pages.
- Expand `/faq` once the `[GAP]` list is answered — access hours, terms, deposits,
  insurance and locks are the most-asked storage questions and none can be
  answered today.
