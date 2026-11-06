/**
 * Blog index metadata. Bodies live in the page files.
 *
 * Prices in those pages are read from src/data/units.ts. Do not hardcode a
 * rate here. Do not describe the indoor climate units as drive-up.
 */

export interface BlogPost {
  slug: string;
  href: string;
  /** Visible h1. Also the BlogPosting headline. */
  headline: string;
  /** Document title before the brand suffix. */
  documentTitle: string;
  description: string;
  datePublished: string;
  dateModified: string;
  /** Last breadcrumb label. Shorter than the h1. */
  crumb: string;
}

export const BLOG_POSTS: readonly BlogPost[] = [
  {
    slug: 'what-to-store-in-climate-controlled-storage',
    href: '/blog/what-to-store-in-climate-controlled-storage',
    headline: 'What to Store in Climate-Controlled Storage in Georgia Humidity',
    documentTitle: 'Climate Storage for Georgia Humidity',
    description:
      'What Georgia humidity does to wood, electronics, photos, instruments and mattresses, and which indoor climate-controlled units in Rossville fit them.',
    datePublished: '2026-10-27',
    dateModified: '2026-10-27',
    crumb: 'Georgia humidity',
  },
  {
    slug: 'climate-controlled-storage-near-chattanooga',
    href: '/blog/climate-controlled-storage-near-chattanooga',
    headline: 'Climate-Controlled Storage Near Chattanooga',
    documentTitle: 'Climate Storage Near Chattanooga',
    description:
      'Indoor climate-controlled storage near Chattanooga at 132 Mack Smith Road, Rossville. Directions from US-27 and Cloud Springs Road. Call (706) 858-6498.',
    datePublished: '2026-10-27',
    dateModified: '2026-10-27',
    crumb: 'Near Chattanooga',
  },
];

export function getBlogPost(slug: string): BlogPost {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown blog post: ${slug}`);
  return post;
}

/** Calendar date, UTC, so a build in another timezone cannot shift the day. */
export function formatBlogDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
