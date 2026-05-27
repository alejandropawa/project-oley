# TROKO

TROKO is a Romanian marketplace web app for local selling, buying, renting, and exchanging.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local.example` to `.env.local` and add the public Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://troko.ro
```

The app builds without Supabase values and falls back to local public mock data.

## Quality Checks

```bash
pnpm lint
pnpm build
```

## SEO Checks

With the dev server running:

- Inspect `/sitemap.xml` and confirm only public routes are listed.
- Inspect `/robots.txt` and confirm account, inbox, admin, and auth routes are disallowed.
- Open a listing, city page, or category-city page and check the page source for `application/ld+json`.
- Validate JSON-LD with Google Rich Results Test or Schema.org Validator.
- Run Lighthouse locally against `/`, `/anunturi`, `/orase`, and a listing detail page.
