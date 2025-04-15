import { defineCollection, z } from 'astro:content';

const articlesCollection = defineCollection({
  schema: z.object({
    author: z.string().optional(),
    cta: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    excludeFromNav: z.boolean().default(false),
    htmlTitle: z.string().optional(),
    icon: z.string().optional(),
    darkIcon: z.string().optional(),
    section: z.string(),
    sortTitle: z.string().optional(),
    title: z.string(),
    featured: z.boolean().default(false),
  }),
});

const devToolsCollection = defineCollection({
  schema: z.object({
    author: z.string().optional(),
    cta: z.string().optional(),
    color: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    faIcon: z.string().optional(),
    icon: z.string().optional(),
    title: z.string()
  }),
});

const quickstartsCollection = defineCollection({
  schema: z.object({
    author: z.string().optional(),
    cta: z.string().optional(),
    description: z.string(),
    disableTOC: z.boolean().default(false),
    excludeFromNav: z.boolean().default(false),
    htmlTitle: z.string().optional(),
    icon: z.string().optional(),
    section: z.string(),
    title: z.string(),
    sortTitle: z.string().optional(),
    featured: z.boolean().default(false),
    faIcon: z.string().optional(),
    color: z.string().optional(),
    codeRoot: z.string().optional(),
  }),
});

const docsCollection = defineCollection({
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
    section: z.string().optional(),
    subcategory: z.string().optional(),
    tertcategory: z.string().optional(),
    quatercategory: z.string().optional(),
    nestedHeadings: z.boolean().optional(),
    disableTOC: z.boolean().default(false),
    navOrder: z.number().default(1000),
    idpDisplayName: z.string().optional(),
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
    blurb: z.string().optional(),
  }),
});

const jsonCollection = defineCollection({
  type: 'data',
})

export const collections = {
  'articles': articlesCollection,
  'dev-tools': devToolsCollection,
  'quickstarts': quickstartsCollection,
  'docs': docsCollection,
  'json': jsonCollection,
  'blog': blogCollection,
};
