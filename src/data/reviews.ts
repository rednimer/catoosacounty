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
  /** When it was posted, as Google reports it. */
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
 * Real customer reviews, verbatim.
 *
 * Only three of the twenty-one are publicly readable without signing in to
 * Google, and only one of those is usable — the other two are five years old and
 * one of them predates the current ownership (it says so explicitly). So this
 * list is short because it is honest, not because the business lacks reviews.
 *
 * To add the rest, legitimately:
 *   1. Google Places API `place_details` — up to five reviews, licensed for
 *      display provided Google is credited and the text is not edited.
 *   2. The owner copies them from the Google Business Profile dashboard.
 *
 * Scraping the remaining reviews out of Maps is against Google's terms and is
 * not an option.
 */
export const REVIEWS: readonly Review[] = [
  {
    quote:
      'Great storage facility. Affordable and clear correspondence and communication from the owner. Very personable place if you prefer that to big storage companies',
    author: 'Hailey Nichols',
    posted: 'a year ago',
    source: 'Google',
  },
];

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
