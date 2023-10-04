import {defineConfig} from 'astro/config';
import compress from "astro-compress";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import indexPages from "astro-index-pages/index.js";
import {rehypeTasklistEnhancer} from './src/plugins/rehype-tasklist-enhancer';
import {marked} from 'marked';
import {codeTitleRemark} from './src/plugins/code-title-remark';

/*
 * Configuring marked to render blog excerpts as plain text, effectively taking anything that would go to html and just spitting out the text.
 * See: https://marked.js.org/using_pro
 */
const inlineExtensions = ['link', 'heading', 'code', 'codespan'].map(name => (
    {
      name,
      renderer(token) {
        return token.text;
      }
    }
));

const extensions = [
  // every excerpt will be wrapped in a <p>, render what is inside before returning it
  {
    name: 'paragraph',
    renderer(token) {
      return this.parser.parseInline(token.tokens);
    }
  },
  ...inlineExtensions
];

marked.use({extensions});

const config = defineConfig({
  build: {
    format: 'file'
  },
  integrations: [
    compress({
      Image: false,
      SVG: false,
    }),
    mdx(),
    sitemap(),
    indexPages(),
    tailwind({
      config: {
        applyBaseStyles: false
      }
    })
  ],
  markdown: {
    remarkPlugins: [
        codeTitleRemark
    ],
    rehypePlugins: [
        // Tweak GFM task list syntax
        rehypeTasklistEnhancer(),
    ]
  },
  site: 'https://fusionauth.io/'
});

export default config;
