import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    author: z.string(),
    description: z.string(),
    excludeFromIndex: z.boolean().default(false),
    image: z.string(),
    indexPage: z.boolean().default(false),
    section: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
};