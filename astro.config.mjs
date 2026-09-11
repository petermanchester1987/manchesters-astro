import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';

// Individual pages opt into static prerendering with
// `export const prerender = true;` (output: 'server' does not prerender
// by default). The two API routes (src/pages/api/enquiry.ts and
// src/pages/api/newsletter.ts) stay dynamic Vercel serverless functions.
export default defineConfig({
  site: 'https://www.the-manchesters.com',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  image: {
    // Sharp is the default and only image service used for astro:assets
    // processing (resizing, format conversion to webp/avif, etc).
    // `layout: 'constrained'` turns on responsive images site-wide: every
    // <Image> now gets a real srcset of multiple resolutions plus a
    // `sizes` attribute, so a phone downloads a phone-sized file instead
    // of the same full desktop-resolution image everyone else gets —
    // without this, every <Image> renders as a single fixed-size file
    // with no srcset at all. Full-bleed hero backgrounds override this
    // per-instance with layout="full-width" (see HeroVideo.astro and
    // index.astro's hero image).
    layout: 'constrained',
    responsiveStyles: true,
  },

  // Astro's built-in Fonts API: self-hosts the fonts, preloads them, and
  // generates a metric-matched fallback font automatically (optimizedFallbacks
  // defaults to true) — this removes the visible "flash of fallback font"
  // swap that plain @font-face + font-display: swap causes. Stable as a
  // top-level `fonts` key as of this Astro version (was `experimental.fonts`
  // on 5.x).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      weights: [700, 800, 900],
      styles: ['normal', 'italic'],
      fallbacks: ['Iowan Old Style', 'Georgia', 'serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Space Grotesk',
      cssVariable: '--font-space-grotesk',
      weights: [400, 500, 700],
      styles: ['normal'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
  ],
});
