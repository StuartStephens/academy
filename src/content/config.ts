import { defineCollection, z } from 'astro:content';

const curriculum = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['draft', 'published']).default('draft'),
    visibility: z.enum(['public', 'unlisted']).default('public'),
    updatedAt: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { curriculum };
