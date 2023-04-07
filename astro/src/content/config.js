import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    author: z.string(),
    date: z.date(),
    description: z.string(),
    image: z.string(),
    section: z.string(),
    title: z.string(),
  }),
});

export const collections = {
  'articles': articlesCollection,
};