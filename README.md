# Field Notes Curriculum

Curriculum publisher built with Astro and UnoCSS. Content is now CMS-ready via a Sanity adapter layer while preserving a fallback path to local MDX during migration.

## Stack

- Astro 4
- UnoCSS with typography preset
- Sanity Content Lake via `@sanity/client`
- Portable Text rendering via `astro-portabletext`

## Content Source Modes

The app supports two content modes:

1. **Sanity mode (default for production)**
   - Enabled when `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` are set
   - Reads curriculum documents from Sanity
   - Renders body using Portable Text

2. **Local MDX fallback mode**
   - Used automatically when Sanity env vars are not set
   - Reads legacy files from `src/content/curriculum/*.mdx`
   - Lets you develop safely while migrating content

## Environment Variables

Copy `.env.example` to `.env` and fill values:

- `PUBLIC_SANITY_PROJECT_ID` (required for Sanity mode)
- `PUBLIC_SANITY_DATASET` (required for Sanity mode)
- `PUBLIC_SANITY_API_VERSION` (optional, default: `2024-06-01`)
- `SANITY_API_READ_TOKEN` (optional, only needed for private datasets)
- `PUBLIC_RENTCAST_API_KEY` (optional, enables "On market only" filter in the Georgia real estate MVP)

## Sanity Studio (Editor URL)

A standalone Studio app is included at `studio/`.

### Setup

1. `cd studio`
2. `npm install`
3. Copy `studio/.env.example` to `studio/.env`
4. Set:
   - `SANITY_STUDIO_PROJECT_ID`
   - `SANITY_STUDIO_DATASET`

### Run Studio locally

- `npm run dev`
- from repo root: `npm run studio:dev`

### Publish Studio URL (hosted by Sanity)

- `npm run deploy`
- from repo root: `npm run studio:deploy`

This gives you a shareable editor URL (you can later move Studio to your own subdomain).

## Commands (main site)

- `npm install` - install dependencies
- `npm run dev` - run local development server
- `npm run check:spec` - validate curriculum spec
  - Uses Sanity validation when Sanity env vars are present
  - Falls back to MDX frontmatter validation otherwise
- `npm run build` - run spec checks, then create production build in `dist/`
- `npm run preview` - preview built site locally

## Portable Text Blocks Supported

Curriculum `body` supports:

- Standard rich text blocks (`normal`, `h2`, `h3`, `h4`, `blockquote`, lists, links)
- `alert` (tone + title + nested rich text)
- `youtubeEmbed` (video id + title)
- `mapEmbed` (`highlights`, `relief`, `strategic`)
- `worldMapHighlights`, `worldReliefMap`, `worldStrategicMap`

## Key Paths

- `src/lib/content.ts` - content adapter (Sanity + local fallback)
- `src/lib/sanity.ts` - shared Sanity client config
- `src/pages/index.astro` - homepage listing
- `src/pages/curriculum/[...slug].astro` - curriculum detail route
- `src/components/portable-text/` - Portable Text block renderers
- `check-spec.mjs` - spec validator (Sanity/local-aware)
- `studio/` - Sanity Studio project
- `specs/mvp-curriculum-site-spec.norg` - MVP product/technical spec
- `AGENTS.md` - repository guidance for coding agents
