/**
 * Single source of truth for business identity (NAP), hours and URLs.
 *
 * NAP consistency is a direct local-SEO ranking factor: the name, address and
 * phone here must match Google Business Profile and every directory listing
 * byte for byte. Never hardcode any of these values in a page or component —
 * import from here so there is exactly one place to change them.
 *
 * Facts sourced from _source/CONTENT-SOURCE.md. Do not add claims about this
 * business that are not in that file.
 *
 * ── THE PREVIOUS BUILD GOT THIS WRONG ────────────────────────────────────────
 * The May 2026 attempt (preserved in _source/old-site/) shipped the phone number
 * (706) 861-2327, which matches no verified listing anywhere, plus invented hours
 * and unsourced geo coordinates — all of it in schema.org markup. Every value in
 * this file must trace to CONTENT-SOURCE.md or be explicitly null.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SITE = {
  name: 'Catoosa County Storage',
  /**
   * Yelp, YellowPages and CMac all list the longer name. Emitted as schema.org
   * alternateName so the listings and the site reconcile to one entity.
   * See CONTENT-SOURCE.md §1 — the listings should be corrected to match.
   */
  alternateName: 'Catoosa County Climate Controlled & Self Storage',
  url: 'https://catoosacountystorage.com',
  tagline: 'Climate-controlled storage in Rossville, Georgia',
  description:
    'Climate-controlled storage in Rossville, GA. Indoor hallway units at 132 Mack Smith Road, and sealed dust-free containers at $100 a month. Call (706) 858-6498.',
} as const;

export const CONTACT = {
  /**
   * Owner-confirmed 2026-08-09. Matches the live contact page and every directory.
   *
   * Note: the current site's "Reserve a Unit" page shows 706-848-6498 — an
   * 848/858 transposition that appears nowhere else. It is a typo on that page.
   */
  phoneDisplay: '(706) 858-6498',
  /** E.164 for tel: links. Never render this to screen. */
  phoneHref: 'tel:+17068586498',
  /** [GAP] No email is published anywhere. Ask the owner. */
  email: null,
  emailHref: null,
} as const;

export const ADDRESS = {
  /**
   * [GAP] The Google Business Profile reads `132 S Mack Smith Rd` — with an `S`
   * this site does not have, and abbreviated. Yelp says `132 Mack Smith Rd`; the
   * live site says `132 Mack Smith Road`. Three spellings of one address.
   *
   * NAP has to be byte-identical across the site, GBP and every directory to
   * count as the same entity, so this needs deciding, not averaging. GBP is the
   * one that drives local ranking — if the `S` is genuinely part of the address,
   * change it here and match everywhere else to it.
   */
  street: '132 Mack Smith Road',
  city: 'Rossville',
  state: 'GA',
  stateName: 'Georgia',
  /**
   * RESOLVED 2026-08-09. The Google Business Profile lists 30741, which settles
   * the conflict against the live payments page's 30742 — GBP is the record that
   * actually drives local ranking, so it wins.
   */
  zip: '30741',
  country: 'US',
  /**
   * [GAP] NOT VERIFIED. The May build shipped 34.9834, -85.2864 in schema with no
   * source. Left null deliberately — Schema.astro omits `geo` entirely rather than
   * publish a guess. Verify against the parcel, then fill in.
   */
  geo: null as { lat: number; lng: number } | null,
  /** Verbatim from the live directions page. The landmark is the useful part. */
  accessNote:
    'From Cloud Springs Road (GA-146), go north on Mack Smith Road about a tenth of a mile. The office is on the right, after the second house.',
  get formatted(): string {
    return `${this.street}, ${this.city}, ${this.state} ${this.zip}`;
  },
} as const;

/**
 * [GAP — BLOCKER] Hours are NOT published on the live site and were invented by the
 * May build. The only third-party signal is YellowPages' "9:00 am – 5:00 pm daily",
 * which is not a reliable source.
 *
 * `published: false` makes every hours block on the site degrade to
 * "Call for current hours" instead of guessing, and Schema.astro omits
 * openingHoursSpecification entirely.
 *
 * Per the playbook: never assume 24/7, and never overstate gate access.
 * Flip to true and fill in `office` / `gate` once the owner confirms.
 */
export const HOURS = {
  published: false,
  fallbackNote: 'Call for current office and gate hours',
  office: null as { label: string; note?: string; days: { day: string; hours: string }[] } | null,
  gate: null as { label: string; note?: string; days: { day: string; hours: string }[] } | null,
} as const;

export const EXTERNAL = {
  /**
   * Existing-customer payments only. Never link a new prospect here before the lead
   * is captured — the current site hands every inquiry straight to U-Haul.
   */
  uhaulPayments: 'https://www.uhaul.com/Orders/',
} as const;

export const NAV = [
  { label: 'Units & Pricing', href: '/units' },
  { label: 'Climate Controlled', href: '/climate-controlled-storage' },
  { label: 'Size Guide', href: '/storage-unit-size-guide' },
  { label: 'Location', href: '/location' },
  { label: 'FAQ', href: '/faq' },
] as const;

/**
 * Verified facility features ONLY. Every claim here traces to CONTENT-SOURCE.md §7.
 *
 * The live site makes exactly two product claims — climate control and drive-up —
 * so this list is deliberately short. A short list of true things outperforms a long
 * list of guesses, and a fabricated amenity is a legal exposure the moment a customer
 * arrives and finds otherwise.
 *
 * Do NOT add without owner confirmation: gated/coded access, cameras, lighting,
 * individually locked units, paved drives, pest treatment, month-to-month terms,
 * insurance, locks, business storage, locally owned, or any drive-time claim.
 * All of those appeared as fact in the May build with no source.
 *
 * Monthly rates and "$25 one-time admin fee, no security deposit" are published
 * from the WebSelfStorage Catoosa rate card (facility 1030704, read 2026-10-25)
 * in src/data/units.ts. The 8x20 container is featured at $100. Covered parking
 * stays off the pages. Container copy is limited to sealed and dust-free.
 * Do not stretch the card into any other amenity.
 */
export const FEATURES = [
  {
    title: 'Climate-controlled units',
    body: 'Indoor units. You walk in a door and the units are along a hallway — not drive-up. Temperature and humidity are controlled, so North Georgia summers stay out of your furniture, electronics and paperwork.',
  },
  {
    title: 'Sealed storage containers',
    body: 'A premium option alongside the climate-controlled units. Sealed and dust-free, 8 by 20 feet and 8 feet high, $100 a month. Not climate-controlled, and not drive-up.',
  },
  {
    title: 'Drive-up units',
    body: 'Pull your vehicle right to the door and unload. These three sizes are not climate-controlled.',
  },
  {
    title: 'Both kinds on one property',
    body: 'Store the furniture in climate control and the yard equipment in a drive-up unit, at the same address.',
  },
  {
    title: 'Just off Cloud Springs Road',
    body: 'A tenth of a mile up Mack Smith Road — minutes from Fort Oglethorpe, Rossville and the Tennessee line.',
  },
] as const;

/**
 * Communities served — used for local SEO copy and the location page.
 *
 * The Tennessee entries are deliberate: the state line is about a mile north, and
 * East Ridge and south Chattanooga residents routinely store on the Georgia side.
 */
export const SERVICE_AREA = [
  'Rossville',
  'Fort Oglethorpe',
  'Cloud Springs',
  'Ringgold',
  'Chickamauga',
  'East Ridge, TN',
  'Chattanooga, TN',
] as const;
