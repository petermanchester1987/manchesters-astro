# The Manchesters — website

Astro rebuild of the-manchesters.com. Content lives in local Markdown
(`src/content/`), images are processed with `astro:assets` (Sharp), and the
mailing-list signup and booking-enquiry form are both powered by Brevo
through two Vercel serverless functions.

## Brand

- **Palette** — "Marquee Voltage": an ink-navy stage-dark base (`--ink`)
  with hot coral, amber and cyan accents, like gel lighting hitting the
  stage. Each show then gets its own accent variant (`.accent-parchment` /
  `.accent-regal` / `.accent-carnival`) so the three shows stay visually
  distinct on their own pages while sharing one system — Fleetwood Mac
  stays cream/navy (matching its existing poster), Queen leans on amber and
  coral (matching the gold + colour-splash of its existing poster), and
  Tribute Mad gets a punchier cyan accent as the wildcard show. Two colours
  are fixed sitewide regardless of which show accent is active, by explicit
  request: the primary CTA button is always coral (`--coral`), and the
  small "eyebrow" label above headings is always cyan (`--cyan`). All
  tokens live in `src/styles/global.css` — start there to adjust colour.
- **Type** — Fraunces (display/headlines, bold italic at weight 800) +
  Space Grotesk (everything else), loaded from Google Fonts in
  `src/layouts/BaseLayout.astro`. Headlines occasionally pick out one word
  or short phrase in coral via the `.accent-word` class (see the hero H1 in
  `index.astro` and the show title in `shows/[slug].astro`) — used
  deliberately and sparingly, not on every heading.
- **Photography** — the existing show poster artwork is used as-is (it's
  already a distinct, established piece of brand identity per show,
  particularly the Fleetwood Mac and Queen logotypes) rather than
  recreated.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in real values, see below
npm run dev
```

## Content model

Everything editorial lives in `src/content/` as Markdown with typed
frontmatter (schema in `src/content/config.ts`):

- `shows/` — the three shows. Add a new show by dropping in a new `.md`
  file; it will automatically appear in the header dropdown, the homepage
  grid, and get its own `/shows/[slug]` page.
- `testimonials/` — quotes, optionally tagged to a specific `show`.
- `clients/` — cruise lines and other past clients. Each currently renders
  as a text wordmark (`logoText`) since only a screenshot of the logos was
  available, not individual files — **drop real logo SVG/PNG files into
  `src/assets/clients/` and reference them via the `logo` field** for
  crisper rendering.

## Forms

The two forms use different backends:

- `src/components/NewsletterSignup.astro` posts to
  `src/pages/api/newsletter.ts`, a Vercel serverless function
  (`export const prerender = false`) that adds the email to a Brevo list
  (`POST /v3/contacts`).
- `src/components/EnquiryForm.astro` posts straight from the browser to
  Web3Forms (`POST https://api.web3forms.com/submit`) — no server code
  involved, so there's no `api/enquiry` route. Web3Forms emails the
  submission to whichever address the access key is registered to.

Required environment variables (see `.env.example`):

| Variable | Where to find it |
| --- | --- |
| `BREVO_API_KEY` | Brevo → Settings → SMTP & API → API keys |
| `BREVO_LIST_ID` | Brevo → Contacts → Lists → open a list → number in the URL |
| `PUBLIC_WEB3FORMS_ACCESS_KEY` | web3forms.com — enter the destination email, no account needed |

Set these in Vercel under **Project Settings → Environment Variables**
(and locally in `.env`, which is gitignored). `PUBLIC_WEB3FORMS_ACCESS_KEY`
is meant to be public — it's submitted from client-side JS — while
`BREVO_API_KEY` must stay server-only.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Import it in Vercel — it will detect Astro automatically via
   `@astrojs/vercel`.
3. Add the environment variables above in the Vercel dashboard.
4. Deploy. Every page is statically prerendered except the two API routes,
   which run as serverless functions.

## Things worth doing next

- Replace the client logo text wordmarks with real logo files once you can
  export them individually (see Content model above).
- Add individual headshots for Rachel and Peter — the About page currently
  reuses the one duo photo for both bios.
- Write a real accessibility statement (`src/pages/accessibility.astro`
  currently has placeholder copy calling this out).
- Add an Open Graph image at `public/og-image.jpg` (referenced by
  `BaseLayout.astro` but not yet created).
- Consider a short video/reel embed on the homepage or a show page — you
  mentioned "throwing tons of energy" at the shows, and a clip would prove
  that better than any copy.
