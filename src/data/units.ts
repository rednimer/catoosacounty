/**
 * Unit catalogue — sizes, "what fits" copy and starting-at pricing.
 *
 * ─── UPDATING RATES ──────────────────────────────────────────────────────────
 * This is the ONLY place prices live. Set `priceFrom` to a number and it flows
 * automatically to the units page, size guide, homepage, reserve form and schema.
 *
 * `priceFrom: null` means "rate not supplied yet" and the UI degrades honestly to
 * "Call for pricing" — it never shows a fabricated number.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── ⚠ THE SIZE LIST IS PROVISIONAL ──────────────────────────────────────────
 * The live site publishes NO unit sizes. Not one. The sizes below are the standard
 * self-storage size ladder — they are what this facility most likely stocks, and
 * they are what the May 2026 build used, but *that build had no source for them
 * either* and presented them as fact.
 *
 * So they are flagged. While `CATALOGUE_PROVISIONAL` is true:
 *   - every size table renders a visible "typical sizes — call to confirm" note
 *   - `npm run audit:content` prints a warning naming this file
 *
 * Flip it to false once the owner confirms which sizes actually exist, in which
 * type, and delete any row the facility does not stock.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CATALOGUE_PROVISIONAL = true;

/** Which of the two verified product types a size is available in. */
export type UnitType = 'climate' | 'driveUp';

export interface StorageUnit {
  /** URL-safe id, also used as the anchor target and form <option> value. */
  slug: string;
  /** Display name, e.g. "10x20". */
  name: string;
  width: number;
  depth: number;
  /** Square footage, derived. */
  get sqft(): number;
  /**
   * [PROVISIONAL] Which types this size comes in. Unconfirmed — the live site says
   * only that both climate and drive-up units exist, not which sizes are in which.
   */
  availableIn: readonly UnitType[];
  /** Everyday space this is the size of. The single most useful thing on a size page. */
  comparableTo: string;
  /** What actually fits. */
  fits: string;
  /** Monthly "starting at" price in USD. `null` until the owner supplies rates. */
  priceFrom: number | null;
  /** Shown as a scannable list on the units page. */
  goodFor: readonly string[];
  /** Surfaced in the "most popular" position on the homepage. */
  popular?: boolean;
}

function unit(u: Omit<StorageUnit, 'sqft'>): StorageUnit {
  return {
    ...u,
    get sqft() {
      return this.width * this.depth;
    },
  };
}

export const UNITS: readonly StorageUnit[] = [
  unit({
    slug: '5x5',
    name: '5x5',
    width: 5,
    depth: 5,
    availableIn: ['climate', 'driveUp'],
    comparableTo: 'A hall closet',
    fits: 'Boxes, seasonal decorations, a chest of drawers and a few small pieces. About what fits in the back of a hatchback.',
    priceFrom: null,
    goodFor: ['Seasonal decorations', 'Boxed paperwork', 'Small furniture', 'Sports gear'],
  }),
  unit({
    slug: '5x10',
    name: '5x10',
    width: 5,
    depth: 10,
    availableIn: ['climate', 'driveUp'],
    comparableTo: 'A walk-in closet',
    fits: 'The contents of a studio or small one-bedroom: mattress set, sofa, dining table, and a stack of boxes.',
    priceFrom: null,
    goodFor: ['Studio apartment', 'College dorm contents', 'Bicycles', 'Business records'],
  }),
  unit({
    slug: '10x10',
    name: '10x10',
    width: 10,
    depth: 10,
    availableIn: ['climate', 'driveUp'],
    comparableTo: 'Half a one-car garage',
    fits: 'A one or two-bedroom apartment: refrigerator, washer and dryer, bedroom set, patio furniture and boxes.',
    priceFrom: null,
    goodFor: ['Two-bedroom apartment', 'Appliances', 'Small office', 'During a renovation'],
    popular: true,
  }),
  unit({
    slug: '10x15',
    name: '10x15',
    width: 10,
    depth: 15,
    availableIn: ['climate', 'driveUp'],
    comparableTo: 'A large bedroom',
    fits: 'A two or three-bedroom home: beds, dressers, table and chairs, sofa, TV, appliances and boxes.',
    priceFrom: null,
    goodFor: ['Three-bedroom home', 'Business inventory', 'Long-term storage'],
  }),
  unit({
    slug: '10x20',
    name: '10x20',
    width: 10,
    depth: 20,
    availableIn: ['climate', 'driveUp'],
    comparableTo: 'A one-car garage',
    fits: 'A three or four-bedroom house: major appliances, patio furniture, garage contents and a full load of boxes.',
    priceFrom: null,
    goodFor: ['Whole-house move', 'Four-bedroom home', 'Contractor equipment'],
  }),
  unit({
    slug: '10x30',
    name: '10x30',
    width: 10,
    depth: 30,
    availableIn: ['driveUp'],
    comparableTo: 'A one-and-a-half car garage',
    fits: 'The contents of a large house, or a moving van load with room left to walk around it.',
    priceFrom: null,
    goodFor: ['Large household', 'Commercial inventory', 'Contractors'],
  }),
];

/** Everyday reference points for the size guide. */
export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  climate: 'Climate controlled',
  driveUp: 'Drive-up',
};

/** True when at least one real rate has been supplied. Gates "starting at" copy. */
export const PRICING_AVAILABLE = UNITS.some((u) => u.priceFrom !== null);

/**
 * The one place a price becomes a string.
 *
 * Returns the honest fallback for `null` rather than an empty string or "$0", so
 * a missing rate can never render as a real one. Every price on the site goes
 * through here.
 */
export function formatPrice(priceFrom: number | null): string {
  return priceFrom === null ? 'Call for pricing' : `From $${priceFrom}/mo`;
}

/**
 * [GAP] RV, boat and vehicle parking.
 *
 * The May build gave this its own page and the playbook calls it a distinct
 * high-intent search category worth targeting — but nothing on the live site says
 * this facility offers it. Do not build the page until the owner confirms.
 */
export const HAS_VEHICLE_STORAGE = false;
