import {defineConfig} from 'astro/config';
import compress from "astro-compress";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from '@tailwindcss/vite';
import indexPages from "astro-index-pages/index.js";
import {rehypeTasklistEnhancer} from './src/plugins/rehype-tasklist-enhancer';
import {codeTitleRemark} from './src/plugins/code-title-remark';
import * as markdownExtract from './src/plugins/markdown-extract.js';
import remarkMdx from 'remark-mdx';
import mermaid from 'astro-mermaid';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import linkValidator, { type LinkValidatorOptions } from 'astro-link-validator';

const siteMapFilter = (page) => !page.startsWith('https://fusionauth.io/landing')

const config = defineConfig({
  build: {
    format: 'file'
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mermaid({
      theme: 'forest',
      autoTheme: true,
      enableLog: false,
    }),
    mdx(),
    sitemap({
      filter: siteMapFilter
    }),
    indexPages(),
    markdownExtract.default(),
    compress({
      Image: false,
      SVG: false,
      HTML: false,
    }),
    // only run link validator in the dev environment
    process.env.DEV && linkValidator({
      checkExternal: false,
      externalTimeout: 10,
      failOnBrokenLinks: false,
      verbose: false,
      exclude: [ //destination URLs to exclude from checking -- NOT files!
        '/platform/', '/cdn/', '/dev-tools/', '/tech-papers/', '/docs/quickstarts/', '/feature/', '/features/', '/webinar/',
        '/community/', '/forum/', '/compare/', '/industry/', '/license/', '/partners/', '/video/', '/event/', '/ebooks/', '/glossary/', '/guides/',
        'buildvsbuy', 'auth0-migration', 'community', 'community/forum', 'aws-reinvent22', 'aws-reinvent23', 'pricing', 'download', 'contact',
        'get-started', 'passwordless', 'direct-download', 'jobs', 'careers', 'password-history', 'partners-form', 'partners',
        'resource/all', 'sso', 'kubernetes', 'compare-fusionauth', 'security', 'customers-partners', 'license-faq',
        'feature-list', 'product-privacy-policy', 'passkeys',
      ],
      //base: 'https://fusionauth.io',
    })
  ],
  markdown: {
    remarkPlugins: [
      codeTitleRemark,
      remarkMdx,
    ],
    rehypePlugins: [
      // Tweak GFM task list syntax
      // @ts-ignore
      rehypeTasklistEnhancer(),
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          content: {
            type: 'text',
            value: '',
          },
          properties: {
            title: ['link to header'],
            class: 'anchor-link'
          },
        },
      ],
    ],
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"]
    }
  },
  site: 'https://fusionauth.io/',
});

export default config;
