import { defineCollection, z, reference } from 'astro:content';
import { glob } from 'astro/loaders';

const shows = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/shows' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string(),
      tagline: z.string(),
      // Which visual accent this show borrows from its own existing
      // artwork, so each show page can feel distinct while staying on-brand.
      // fleetwood-mac -> parchment (cream/black, matches the existing poster)
      // queen         -> regal (black/gold/crimson, matches the existing poster)
      // tribute-mad   -> carnival (the multi-act, comedic wildcard show)
      accent: z.enum(['parchment', 'regal', 'carnival']),
      durationMinutes: z.number(),
      songs: z.array(z.string()),
      posterImage: image(),
      posterImageAlt: z.string(),
      // 'cover' (default) crops to fill the portrait poster frame — right
      // for photographic posters. Use 'contain' for artwork that must
      // stay fully visible uncropped, e.g. a landscape logo on its own
      // solid background.
      posterImageFit: z.enum(['cover', 'contain']).default('cover'),
      duoImage: image().optional(),
      duoImageAlt: z.string().optional(),
      // YouTube video ID (the part after youtu.be/ or v=) for an optional
      // promo video on the show's page.
      promoVideoId: z.string().optional(),
      accompanyingShows: z.array(reference('shows')).default([]),
      order: z.number(),
      // Set to false to hide a show from nav/listings without deleting it.
      published: z.boolean().default(true),
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonials' }),
  schema: () =>
    z.object({
      quote: z.string(),
      attribution: z.string(),
      source: z.string(), // e.g. "NCL Epic", "P&O Arcadia"
      show: reference('shows').optional(),
      featured: z.boolean().default(false),
    }),
});

const clients = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/clients' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      logo: image().optional(),
      // Used while real logo artwork hasn't been supplied yet — renders
      // as a clean text wordmark instead of an empty image slot.
      logoText: z.string().optional(),
      url: z.string().url().optional(),
      category: z.enum(['cruise-line', 'other']).default('other'),
      order: z.number(),
    }),
});

export const collections = { shows, testimonials, clients };
