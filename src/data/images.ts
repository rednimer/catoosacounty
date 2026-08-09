/**
 * Image registry.
 *
 * One place for every photograph, its alt text and its provenance. Alt text lives
 * here rather than at the call site so the same photo cannot be described two
 * different ways on two pages.
 *
 * ── PROVENANCE ───────────────────────────────────────────────────────────────
 * Supplied by the owner 2026-08-09 and confirmed as photographs of this facility.
 * Recorded here because it matters: a photo is an implicit claim about what a
 * customer will find when they arrive at 132 Mack Smith Road, and the previous
 * build of this site made a habit of claims nobody had checked.
 *
 * ── RESOLUTION LIMIT (read before using one as a hero) ───────────────────────
 * These arrived web-sized, 372×270 to 996×538, not as camera originals. Astro
 * will not upscale, so any one of them stretched full-bleed across a desktop
 * hero renders soft — and on a 2× display, softer still. Every entry below
 * carries `maxDisplayWidth`: the widest it can be rendered before it visibly
 * degrades. Respect it, or ask the owner for the originals.
 *
 * `sizes` attributes are written to stay at or under that width at every
 * breakpoint. See PLAN.md Phase 0 §9 — full-resolution originals are still the
 * single highest-value asset missing from this site.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * NOTE: importing an image here but never rendering it through Astro's <Image>
 * ships the full original into the build. Register only what is used.
 */
import exteriorGreenDoors from '../assets/exterior-green-doors.png';
import interiorClimateCorridor from '../assets/interior-climate-corridor.png';
import interiorClimateCorridorAlt from '../assets/interior-climate-corridor-alt.png';
import exteriorDriveAisle from '../assets/exterior-drive-aisle.png';
import textureCondensation from '../assets/texture-condensation.png';
import textureFrostedGlass from '../assets/texture-frosted-glass.png';

export interface SiteImage {
  src: ImageMetadata;
  /** Describes what is in frame. Never starts with "image of". */
  alt: string;
  /** Widest sensible rendered width in CSS px, given the source resolution. */
  maxDisplayWidth: number;
}

export const IMAGES = {
  /** Best exterior. Cameras are visible on the eaves — see the note in units.ts. */
  exteriorGreenDoors: {
    src: exteriorGreenDoors,
    alt: 'A row of green roll-up doors on a drive-up storage building, with a gravel drive in front and trees behind.',
    maxDisplayWidth: 558,
  },
  /* `exterior-door-row.png` is deliberately NOT registered. It is still in
     src/assets/ and can be added back the moment a page renders it — but while it
     was registered and unused it shipped as a raw 265 kB PNG, because a bare
     import is enough for the bundler to emit the original. */

  /** The strongest climate-control image and the largest file we have. */
  interiorClimateCorridor: {
    src: interiorClimateCorridor,
    alt: 'A clean, brightly lit interior corridor lined with white climate-controlled storage doors.',
    maxDisplayWidth: 996,
  },
  interiorClimateCorridorAlt: {
    src: interiorClimateCorridorAlt,
    alt: 'An interior hallway of white climate-controlled storage units receding towards a lit exit.',
    maxDisplayWidth: 988,
  },
  exteriorDriveAisle: {
    src: exteriorDriveAisle,
    alt: 'A wide paved drive aisle running between two facing rows of green drive-up storage doors.',
    maxDisplayWidth: 496,
  },

  /*
   * ── Generated textures ─────────────────────────────────────────────────────
   * Generated 2026-08-09 (Higgsfield, recraft_v4_1) against the CLIMATE CLEAR
   * palette. These are abstract material studies, NOT depictions of this
   * facility — that distinction is the whole reason they are safe to use.
   *
   * They are decorative, so both carry empty alt text and must never be the only
   * carrier of information. Anything laid over them needs its own scrim: the
   * condensation frame runs from near-white to deep navy, so text placed
   * directly on it would pass contrast in one corner and fail in another.
   *
   * Unlike the photographs these are full-size (1344px), so they can go
   * full-bleed.
   */
  textureCondensation: {
    src: textureCondensation,
    alt: '',
    maxDisplayWidth: 1344,
  },
  textureFrostedGlass: {
    src: textureFrostedGlass,
    alt: '',
    maxDisplayWidth: 1344,
  },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof IMAGES;
