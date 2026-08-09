// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { SITE } from './src/data/site';

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'never',
  integrations: [
    sitemap({
      // Keep noindex pages out: listing a page we tell robots not to index
      // sends search engines contradictory signals.
      filter: (page) => !page.includes('/reserve/thank-you'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Emit `/units.html` rather than `/units/index.html` so it pairs with
    // trailingSlash: 'never' and Vercel serves canonical, redirect-free URLs.
    format: 'file',
  },
  image: {
    // Source photos are 2.5–3.4 MB originals; these are the only widths we ship.
    responsiveStyles: true,
    layout: 'constrained',
  },
});
