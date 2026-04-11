import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const releasesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"],
    base: "./src/content/releases",
    generateId: ({ entry }) => `${entry.replace(/\.mdx$/, '')}`,
  }),
  schema: z.object({
    version: z.string(),
    date: z.date(),
    name: z.string().optional()
  }),
})

const articlesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"],
    base: "./src/content/articles",
    generateId: ({ entry }) => `${entry.replace(/\.mdx$/, '')}`,
  }),
  schema: z.object({
    author: z.string().optional(),
    canonicalUrl: z.string().optional(),
    cta: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    excludeFromNav: z.boolean().default(false),
    htmlTitle: z.string().optional(),
    icon: z.string().optional(),
    darkIcon: z.string().optional(),
    order: z.number().default(1000),
    title: z.string(),
    featured: z.boolean().default(false),
  }),
});

const docsCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"],
    base: "./src/content/docs",
    generateId: ({ entry }) => `${entry.replace(/\.mdx$/, '')}`,
  }),
  schema: z.object({
    title: z.string().refine(
        title => !/[.!?]$/.test(title),
        { message: "Title cannot end with punctuation" }
    ),
    description: z.string().refine(
        desc => /[.]$/.test(desc),
        { message: "Description must end with a period" }
    ),
    canonicalUrl: z.string().optional(),
    htmlTitle: z.string().optional(),
    sidenavTitle: z.string().optional(),
    nestedHeadings: z.boolean().optional(),
    disableTOC: z.boolean().default(false),
    order: z.number().default(1000),
    idpDisplayName: z.string().optional(),
    sideNavSimple: z.boolean().default(false),
  }),
});

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string().refine(
        title => !/[.]$/.test(title),
        { message: "Title cannot end with a period" }
    ),
    description: z.string().refine(
        desc => /[.!?]$/.test(desc),
        { message: "Description must end with punctuation" }
    ),
    htmlTitle: z.string().optional(),
    image: z.string().optional(),
    authors: z.string().optional(), // comma-separated string
    categories: z.string().optional(), // comma-separated string
    tags: z.string().optional(), // comma-separated string
    publish_date: z.date(),
    updated_date: z.date().optional(),
    featured_tag: z.string().optional(),
    featured_category: z.string().optional(),
    excerpt_separator: z.string().optional(),
    canonicalUrl: z.string().optional(),
    blurb: z.string().optional(),
  }),
});

const jsonCollection = defineCollection({
  type: 'data',
})

export const collections = {
  'docs': docsCollection,
  'articles': articlesCollection,
  'releases': releasesCollection,
  'json': jsonCollection,
  'blog': blogCollection
};
