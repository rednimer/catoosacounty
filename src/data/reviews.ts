/**
 * Customer reviews and the Google Business Profile rating.
 *
 * ─── ⚠ READ THIS BEFORE ADDING A REVIEW ──────────────────────────────────────
 * The May 2026 build of this site shipped three invented five-star testimonials
 * with invented customer names and towns. Fabricated reviews are an FTC matter,
 * not merely a credibility problem, and they are the worst thing that has ever
 * been on this domain.
 *
 * A review goes in this file only if a real customer actually wrote it, with
 * their real name and rating, and only with a `source` saying where it was
 * published. There is no "roughly what someone said" option. If a review is not
 * in this list, it does not exist.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ─── WHY THERE IS NO REVIEW SCHEMA ───────────────────────────────────────────
 * These are deliberately NOT emitted as schema.org Review or AggregateRating.
 * Google's structured-data policy disallows self-serving review markup — a
 * business marking up reviews about itself on its own site — and breaking that
 * risks a manual action. This domain already carries penalty exposure from the
 * WordPress compromise (CONTENT-SOURCE.md §8) and does not need more.
 *
 * Showing reviews on the page is fine and normal. Marking them up is not. The
 * rating renders as plain text beside a link to the real listing, so any visitor
 * can verify it in one click — which is a stronger trust signal than a star
 * graphic nobody can check.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Review {
  /** Verbatim. Never tidied, shortened or "improved". */
  quote: string;
  /** As the reviewer published it. */
  author: string;
  /** 1-5, as given. */
  rating: number;
  /** When it was posted, as Google reports it. Always shown to the reader. */
  posted: string;
  /** Where it was actually published. */
  source: string;
}

/**
 * The public Google listing.
 *
 * URL built from the CID in the listing's own Maps link (`0xc5917055a9616d1`
 * → 889767713144444625) and verified to resolve to this business. Worth noting
 * why this form and not the long `/maps/place/...` URL: the long one served a
 * limited view with no reviews at all, while `?cid=` returns the full listing.
 */
export const GOOGLE_LISTING = {
  url: 'https://maps.google.com/?cid=889767713144444625',
  /** Read off the public listing 2026-08-09. */
  rating: 4.5,
  reviewCount: 21,
  asOf: '2026-08-09',
} as const;

/**
 * Real customer reviews, verbatim. Supplied by the owner from the Google listing
 * 2026-08-09 — a legitimate route, unlike scraping Maps.
 *
 * ── ON THE DATES ─────────────────────────────────────────────────────────────
 * Every entry renders its age, and that is deliberate rather than incidental.
 * A one-star review on the listing says "Poorly maintained after previous owner
 * sold out" and is itself five years old, which puts the sale before roughly
 * 2021. So the two eight-year-old reviews below almost certainly describe a
 * different operator.
 *
 * They are still real reviews of this facility at this address, and showing the
 * date lets a reader weigh them — which is why the date is not optional in the
 * UI. But if the owner wants only their own era represented, delete anything
 * older than five years and the section reflows on its own.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const REVIEWS: readonly Review[] = [
  {
    quote:
      'Great storage facility. Affordable and clear correspondence and communication from the owner. Very personable place if you prefer that to big storage companies',
    author: 'Hailey Nichols',
    rating: 5,
    posted: 'a year ago',
    source: 'Google',
  },
  {
    quote: 'Secure, clean area. Friendly management!',
    author: 'Heidi Hendley',
    rating: 5,
    posted: '8 years ago',
    source: 'Google',
  },
  {
    quote: 'Very friendly clean & convenient',
    author: 'Robert Speer',
    rating: 5,
    posted: '8 years ago',
    source: 'Google',
  },
];

/**
 * Reviews that were supplied but are NOT displayed, and why.
 *
 * Recorded rather than quietly dropped, so the decisions are reviewable and
 * nobody re-adds them by accident. Both are real and both are five stars.
 */
export const REVIEWS_WITHHELD = [
  {
    author: "Come on sweetheart let's do the twist",
    quote:
      'If u need a storage then come on over to Catoosa storage. Reasonable on rentals.',
    posted: '4 years ago',
    reason:
      "Content is good and it is current-owner era, but the reviewer's Google display name reads as a joke handle. Printed as a byline under a testimonial it undercuts the section it is meant to strengthen. Include it if the owner would rather have the recency.",
  },
  {
    author: 'Amanda Carrington',
    quote: 'Good storage unit',
    posted: '6 years ago',
    reason:
      'Three words. Real and positive, but it says nothing a reader can act on and it dilutes the stronger quotes beside it.',
  },
] as const;

/** Gates every testimonial block on the site. */
export const HAS_REVIEWS = REVIEWS.length > 0;

/**
 * [GAP] OWNERSHIP CHANGE — confirm before doing anything else with reviews.
 *
 * A 2021-era one-star review opens "Poorly maintained after previous owner sold
 * out", which means this listing spans at least two operators and some of the
 * 4.5 average is not about the current one. That matters in both directions: old
 * complaints may be unfair to the present owner, and old praise may not be
 * theirs to claim either.
 *
 * Ask the owner when they took over. If it is recent, the right move is to
 * respond publicly to the old negatives noting the change — which lifts the
 * rating far more than anything that can be done on this site.
 */
export const OWNERSHIP_CHANGE_UNCONFIRMED = true;
