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
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

const optionalIntegrations = [];
if (!process.env.DEV) {
  optionalIntegrations.push(compress({
    Image: false,
    SVG: false,
    HTML: false,
  }))
} else {
  console.log('skipping compression');
}

const siteMapFilter = (page) => !page.startsWith('https://fusionauth.io/landing')

const config = defineConfig({
  build: {
    format: 'file'
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    ...optionalIntegrations,
    mermaid({
      theme: 'forest',
      autoTheme: true
    }),
    mdx(),
    sitemap({
      filter: siteMapFilter
    }),
    indexPages(),
    markdownExtract.default()
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
            title: ['copy header link'],
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
  // experimental: {
  //   contentCollectionCache: true,
  // }
});

export default config;
