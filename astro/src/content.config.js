import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import yaml from 'js-yaml';

const releasesCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"],
    base: "./src/content/releases",
    generateId: ({ entry }) => `${entry.replace(/\.mdx$/, '')}`,
  }),
  schema: z.object({
    version: z.string(),
    date: z.date(),
    name: z.string().optional(),
    description: z.string().optional(),
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
    route: z.boolean().default(true),
    order: z.number().default(1000),
    idpDisplayName: z.string().optional(),
    sideNavSimple: z.boolean().default(false),
  }),
});

const blogCollection = defineCollection({
  loader: glob({
    pattern: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"],
    base: "./src/content/blog",
    generateId: ({ entry }) => `${entry.replace(/\.mdx$/, '')}`,
  }),
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
    ogImage: z.string().optional(),
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
  loader: glob({
    pattern: ["**/*.json"],
    base: "./src/content/json",
    generateId: ({ entry }) => `${entry.replace(/\.json$/, '')}`,
  })
})

const directDownloadVersions = defineCollection({
  loader: async () => {
    const response = await fetch('https://account.fusionauth.io/api/version');
    const data = await response.json();
    
    return data.versions.reverse().map((version) => ({
      id: version.replace(/\./g, '_'),
      version: version,
      mVersion: version.replace(/-/g, '.'),
      releaseNotesLink: `/docs/release-notes#version-${version.replace(/\./g, '-')}`
    }));
  },
  schema: z.object({
    id: z.string(),
    version: z.string(),
    mVersion: z.string(),
    releaseNotesLink: z.string()
  })
});

const apiEndpoints = defineCollection({
  loader: {
    name: 'openapi-endpoints',
    load: async ({ store }) => {
      const response = await fetch('https://raw.githubusercontent.com/FusionAuth/fusionauth-openapi/main/openapi.yaml');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }
      
      const file = await response.text();
      
      const spec = yaml.load(file);
      
      store.set({
        id: 'base-spec',
        data: { openapi: spec.openapi, info: spec.info, servers: spec.servers, components: spec.components }
      });

      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, operation] of Object.entries(methods)) {
          if (['parameters', 'servers', '$ref', 'summary', 'description'].includes(method)) continue;
          
          // Ensure consistent ID generation
          const id = `${method}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`.toLowerCase();
          
          store.set({ id, data: { path, method, operation } });
        }
      }
    }
  }
});

export const collections = {
  'docs': docsCollection,
  'articles': articlesCollection,
  'releases': releasesCollection,
  'json': jsonCollection,
  'blog': blogCollection,
  'direct-download-versions': directDownloadVersions,
  'api-endpoints': apiEndpoints,
};
