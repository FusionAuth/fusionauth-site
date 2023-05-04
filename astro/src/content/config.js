import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    author: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    excludeFromNav: z.boolean().default(false),
    icon: z.string().optional(),
    image: z.string().optional(),
    section: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
};