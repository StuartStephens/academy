import { defineCollection, z } from 'astro:content';

const homepageCategories = [
  'health-biology',
  'nature-outdoors',
  'engineering-technology',
  'trades-materials-craft',
  'history-society-belief',
  'strategy-games',
] as const;

const curriculum = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    status: z.enum(['draft', 'published']).default('draft'),
    visibility: z.enum(['public', 'unlisted']).default('public'),
    updatedAt: z.coerce.date(),
    category: z.enum(homepageCategories).optional(),
    homepageOrder: z.number().int().positive().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { curriculum };
