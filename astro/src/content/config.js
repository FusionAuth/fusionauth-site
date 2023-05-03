import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    author: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    excludeFromIndex: z.boolean().default(false),
    image: z.string().optional(),
    indexPage: z.boolean().default(false),
    section: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
};