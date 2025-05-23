import {defineConfig} from 'astro/config';
import compress from "astro-compress";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import indexPages from "astro-index-pages/index.js";
import {rehypeTasklistEnhancer} from './src/plugins/rehype-tasklist-enhancer';
import {codeTitleRemark} from './src/plugins/code-title-remark';
import * as markdownExtract from './src/plugins/markdown-extract.js';
import remarkMdx from 'remark-mdx';

const optionalIntegrations = [];
if (!process.env.DEV) {
  optionalIntegrations.push(compress({
    Image: false,
    SVG: false,
  }))
} else {
  console.log('skipping compression');
}

const siteMapFilter = (page) => !page.startsWith('https://fusionauth.io/landing')

const config = defineConfig({
  build: {
    format: 'file'
  },
  integrations: [
    ...optionalIntegrations,
    mdx(),
    sitemap({
      filter: siteMapFilter
    }),
    indexPages(),
    tailwind({
      applyBaseStyles: true,
      nesting: true,
    })
    ,
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
    ]
  },
  site: 'https://fusionauth.io/',
  // experimental: {
  //   contentCollectionCache: true,
  // }
});

export default config;
