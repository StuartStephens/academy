# AGENTS.md

## Purpose

This repository is a markdown-first curriculum publisher. Agents should prioritize clear content workflows, predictable builds, and low operational complexity.

## Product Constraints

- Keep MVP scope focused on public curriculum publishing.
- Do not introduce auth, progress, or social features unless explicitly requested.
- Do not add external DB ingestion or CMS dependencies unless requested.

## Content Rules

- Curriculum content lives in `src/content/curriculum/*.mdx`.
- Required frontmatter: `title`, `summary`, `status`, `visibility`, `updatedAt`.
- `status` must be `draft|published`.
- `visibility` must be `public|unlisted`.
- Use `tags` as optional string arrays.
- Favor educational clarity and practical structure.

## Build and Validation

- Run `npm run check:spec` before build-impacting changes.
- `npm run build` already runs spec checks first.
- Do not bypass failed checks by weakening validation without explicit user request.

## Engineering Guidelines

- Preserve adapter boundary in `src/lib/content.ts` for future CMS migration.
- Prefer small reusable components over route-level duplication.
- Keep route behavior stable (`/` list and `/curriculum/[slug]/` detail).
- Maintain mobile-friendly readability and semantic markup.

## Repo Hygiene

- Avoid destructive git commands.
- Do not commit secrets or credentials.
- Do not remove user-authored content unless explicitly requested.
