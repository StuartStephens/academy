# Field Notes Curriculum

Markdown-first curriculum site built with Astro and UnoCSS. This is a local-content MVP with MDX component support and a clean adapter path for adding Sanity later.

## Stack

- Astro 4
- MDX integration (`@astrojs/mdx`)
- UnoCSS with typography preset
- Astro content collections for curriculum entries

## Content Authoring

- Create new pages in `src/content/curriculum/*.mdx`
- Required frontmatter:
  - `title`
  - `summary`
  - `status`: `draft` or `published`
  - `visibility`: `public` or `unlisted`
  - `updatedAt`: date
- Optional frontmatter:
  - `tags`: string array

Only `published + public` entries appear on the homepage.

## MDX Components

Use these components directly in MDX pages:

- `Alert` from `src/components/Alert.astro`
- `YoutubeEmbed` from `src/components/YoutubeEmbed.astro`

## Commands

- `npm install` - install dependencies
- `npm run dev` - run local development server
- `npm run check:spec` - validate content spec/frontmatter rules
- `npm run build` - run spec checks, then create production build in `dist/`
- `npm run preview` - preview built site locally

## Key Paths

- `src/pages/index.astro` - curriculum list page
- `src/pages/curriculum/[slug].astro` - curriculum detail route
- `src/lib/content.ts` - content adapter layer (swap internals when adding Sanity)
- `src/content/config.ts` - collection schema
- `specs/mvp-curriculum-site-spec.norg` - draft MVP product/technical spec
- `AGENTS.md` - repository guidance for coding agents
