/**
 * Unit catalogue — sizes, "what fits" copy and monthly rates.
 *
 * ─── UPDATING RATES ──────────────────────────────────────────────────────────
 * This is the ONLY place prices live. They flow to the units page, size guide,
 * homepage, reserve form and schema.
 *
 * Source of truth: WebSelfStorage facility 1030704 Catoosa County Storage,
 * Inventory > Room Sizes & Rates, read 2026-10-25 (single "Rate" column).
 * Do not copy rates from any other facility in that file. These are the rates,
 * not a "starting at" floor — `formatPrice` must not prefix them with "From".
 *
 * Sizes absent from that card (5x5, 10x15, 10x30) are not listed. A size is
 * labeled climate-controlled only when the card says "climate controlled".
 *
 * Climate-controlled units are interior: you walk in a door and the units are
 * along a hallway. They are never drive-up. Publish the three climate sizes
 * first. The 8x20x8 outside container ($100) is featured with them as a premium
 * option. It is sealed and dust-free because the owner said so — the exact USC
 * model was not matched, so no other container construction claims are used.
 * Then the three non-climate drive-up sizes. Covered parking stays off the pages.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Confirmed against the Catoosa rate card. No "typical sizes" caveat. */
export const CATALOGUE_PROVISIONAL = false;

/**
 * Covered parking is on the Catoosa rate card. The owner directed that it stay
 * off the pricing pages, so this remains false and no parking page is built.
 */
export const HAS_VEHICLE_STORAGE = false;

export type UnitKind = 'climate' | 'driveUp' | 'container';

export interface StorageUnit {
  /** URL-safe id, also the anchor target and the reserve form option slug. */
  slug: string;
  /** Display size, e.g. "10x20" or "8x20x10". */
  name: string;
  width: number;
  depth: number;
  /** Square footage of the footprint, derived. */
  get sqft(): number;
  /** The one product type this row is. Never a guess across types. */
  kind: UnitKind;
  /** Everyday space this is the size of. */
  comparableTo: string;
  /** What actually fits, or the rate-card description for non-room products. */
  fits: string;
  /** Monthly rate in USD from the WSS "Rate" column. */
  price: number;
  /** Shown as a scannable list on the units page. */
  goodFor: readonly string[];
  /** Surfaced in the "most popular" position on the homepage. Unused by the template today. */
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
    slug: '5x10-climate',
    name: '5x10',
    width: 5,
    depth: 10,
    kind: 'climate',
    comparableTo: 'A walk-in closet',
    fits: 'The contents of a studio or small one-bedroom: mattress set, sofa, dining table, and a stack of boxes.',
    price: 70,
    goodFor: ['Studio apartment', 'College dorm contents', 'Bicycles', 'Business records'],
  }),
  unit({
    slug: '10x10-climate',
    name: '10x10',
    width: 10,
    depth: 10,
    kind: 'climate',
    comparableTo: 'Half a one-car garage',
    fits: 'A one or two-bedroom apartment: refrigerator, washer and dryer, bedroom set, patio furniture and boxes.',
    price: 100,
    goodFor: ['Two-bedroom apartment', 'Appliances', 'Small office', 'During a renovation'],
    popular: true,
  }),
  unit({
    slug: '10x20-climate',
    name: '10x20',
    width: 10,
    depth: 20,
    kind: 'climate',
    comparableTo: 'A one-car garage',
    fits: 'A three or four-bedroom house: major appliances, patio furniture, garage contents and a full load of boxes.',
    price: 150,
    goodFor: ['Whole-house move', 'Four-bedroom home', 'Contractor equipment'],
  }),
  unit({
    slug: '8x20-container',
    name: '8x20',
    width: 8,
    depth: 20,
    kind: 'container',
    comparableTo: 'Sealed storage container',
    fits: 'An outside container, 8 feet wide by 20 feet long and 8 feet high. Sealed and dust-free. Not climate-controlled, and not drive-up.',
    price: 100,
    goodFor: ['Sealed', 'Dust-free'],
  }),
  unit({
    slug: '5x10-drive-up',
    name: '5x10',
    width: 5,
    depth: 10,
    kind: 'driveUp',
    comparableTo: 'A walk-in closet',
    fits: 'The contents of a studio or small one-bedroom: mattress set, sofa, dining table, and a stack of boxes.',
    price: 55,
    goodFor: ['Studio apartment', 'College dorm contents', 'Bicycles', 'Business records'],
  }),
  unit({
    slug: '10x10-drive-up',
    name: '10x10',
    width: 10,
    depth: 10,
    kind: 'driveUp',
    comparableTo: 'Half a one-car garage',
    fits: 'A one or two-bedroom apartment: refrigerator, washer and dryer, bedroom set, patio furniture and boxes.',
    price: 65,
    goodFor: ['Two-bedroom apartment', 'Appliances', 'Small office', 'During a renovation'],
  }),
  unit({
    slug: '10x20-drive-up',
    name: '10x20',
    width: 10,
    depth: 20,
    kind: 'driveUp',
    comparableTo: 'A one-car garage',
    fits: 'A three or four-bedroom house: major appliances, patio furniture, garage contents and a full load of boxes.',
    price: 105,
    goodFor: ['Whole-house move', 'Four-bedroom home', 'Contractor equipment'],
  }),
];

/** Indoor climate-controlled units, in rate-card order. Never drive-up. */
export const CLIMATE_UNITS = UNITS.filter((u) => u.kind === 'climate');

/** The only non-climate drive-up sizes on the pricing pages. */
export const DRIVE_UP_UNITS = UNITS.filter((u) => u.kind === 'driveUp');

/** Premium sealed containers. Not part of the climate or drive-up size tables. */
export const CONTAINERS = UNITS.filter((u) => u.kind === 'container');

/**
 * Labels for the type column. Climate rows say they are indoor.
 * They must never be labeled drive-up. Containers are neither.
 */
export const UNIT_TYPE_LABEL: Record<UnitKind, string> = {
  climate: 'Indoor climate-controlled',
  driveUp: 'Drive-up',
  container: 'Sealed container',
};

/**
 * Shown beside the rates. The site has no move-in-special banner, so the
 * discount is stated next to the prices. Wording is the Catoosa card:
 * 1st month free, 2nd month free, admin fee $25, and no security deposit.
 */
export const RATE_TERMS =
  '1st and 2nd month free. $25 one-time admin fee, no security deposit.';

function listRates(kind: UnitKind): string {
  return UNITS.filter((u) => u.kind === kind)
    .map((u) => `${u.name} ${formatPrice(u.price)}`)
    .join(', ');
}

/** One paragraph of every published monthly rate, derived from `UNITS`. */
export const PRICING_SUMMARY = [
  `Indoor climate-controlled: ${listRates('climate')}`,
  `Sealed, dust-free container: ${listRates('container')}`,
  `Drive-up, not climate-controlled: ${listRates('driveUp')}`,
].join('. ') + '.';

/** True when every row has a real monthly rate. */
export const PRICING_AVAILABLE = UNITS.length > 0 && UNITS.every((u) => u.price > 0);

/**
 * The one place a price becomes a string.
 * Every price on the site goes through here.
 */
export function formatPrice(price: number): string {
  return `$${price}/mo`;
}

/** schema.org Offer name. Climate appears only on climate-controlled rows. */
export function offerName(unit: StorageUnit): string {
  switch (unit.kind) {
    case 'climate':
      return `${unit.name} indoor climate-controlled storage unit`;
    case 'driveUp':
      return `${unit.name} drive-up storage unit`;
    case 'container':
      return `${unit.name} sealed storage container`;
  }
}

/** schema.org offer description. Climate units are interior, not drive-up. */
export function offerDescription(unit: StorageUnit): string {
  const access =
    unit.kind === 'climate'
      ? 'Indoor climate-controlled unit. Walk in a door; the units are along a hallway. Not drive-up.'
      : unit.kind === 'container'
        ? 'Sealed and dust-free outside storage container. Not climate-controlled and not drive-up.'
        : 'Drive-up unit, not climate-controlled.';
  return `${access} ${unit.fits}`;
}
