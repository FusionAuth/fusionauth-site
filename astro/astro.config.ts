import {defineConfig, fontProviders} from 'astro/config';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import mdx from "@astrojs/mdx";
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import indexPages from "astro-index-pages/index.js";
import {codeTitleRemark} from './src/plugins/code-title-remark';
import genMarkdownPages from 'astro-gen-markdown-pages';
import { remarkMermaidSSR, mermaidTitleFix } from 'astro-mermaid-renderer-cli-smol';
import remarkMdx from 'remark-mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import linkChecker from 'astro-link-checker';
import { visit } from 'unist-util-visit';
import icon from "astro-iconset";
import { rehypeCodeMeta } from './src/plugins/rehype-code-meta.mjs';
import astroToc from 'astro-toc-smol';
import { openapiSummary } from './src/plugins/openapi-summary.js';

function buildSitemap() {
  let siteUrl: string;
  return {
    name: 'build-sitemap',
    hooks: {
      'astro:config:done': ({ config }: { config: { site?: string } }) => {
        siteUrl = (config.site ?? 'https://fusionauth.io').replace(/\/$/, '');
      },
      'astro:build:done': async ({ dir, pages }: { dir: URL; pages: { pathname: string }[] }) => {
        const ioXml = await readFile(new URL('sitemap-io.xml', dir), 'utf-8');
        const ioUrls = [...ioXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

        const docUrls: string[] = [];
        for (const { pathname } of pages) {
          if (pathname.startsWith('/landing/') || pathname.endsWith('.md') || pathname === '/404') continue;
          const p = pathname === '' ? '/' : (pathname.startsWith('/') ? pathname : '/' + pathname);
          const rel = p === '/' ? 'index.html' : p.slice(1) + '/index.html';
          const isIndex = existsSync(new URL(rel, dir));
          docUrls.push(siteUrl + (isIndex ? (p === '/' ? '/' : p + '/') : p));
        }

        const allUrls = [...new Set([...ioUrls, ...docUrls])].sort();
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...allUrls.map(u => `  <url><loc>${u}</loc></url>`),
          '</urlset>',
          '',
        ].join('\n');
        await writeFile(new URL('sitemap.xml', dir), xml, 'utf-8');
      },
    },
  };
}

export const remarkShellSessionPrompts = () => {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'shell-session') return;

      const lines = node.value.split('\n');
      let continuation = false;

      node.value = lines.map(line => {
        if (!line.trim()) {
          continuation = false;
          return line;
        }
        if (continuation) {
          continuation = line.trimEnd().endsWith('\\');
          return line;
        }
        if (line.startsWith('$ ') || line.startsWith('# ')) {
          continuation = line.trimEnd().endsWith('\\');
          return line;
        }
        continuation = line.trimEnd().endsWith('\\');
        return '$ ' + line;
      }).join('\n');
    });
  };
};

export const rehypeCopyButton = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      // Find the code blocks
      if (node.tagName === 'pre') {
        const codeChild = node.children?.find((c: any) => c.tagName === 'code');
        const classes: string[] = codeChild?.properties?.className ?? [];
        if (classes.includes('language-mermaid')) return;

        // insert new copy code button in a div next to the code block
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: { 
            className: ['relative', 'group'] 
          },
          children: [
            node,
            {
              type: 'element',
              tagName: 'copy-code-button',
              properties: {},
              children: []
            }
          ]
        };

        parent.children[index] = wrapper;
        
        return [visit.SKIP, index + 1];
      }
    });
  };
};

const lightboxProvider = () => {
  return {
    name: 'mdx-lightbox-provider',
    enforce: 'post',
    transform(code, id) {
      if(!id.endsWith('.mdx')) return;
      code = `import _LightboxImage from "src/components/LightboxImage.astro";\n${code}`;
      code = code.replace(
        "components: { Fragment: _Fragment, ...props.components, },",
        "components: { Fragment: _Fragment, img: _LightboxImage, ...props.components, },"
      );
      return code;
    }
  }
}

const config = defineConfig({
  build: {
    format: 'file',
    concurrency: 12,
  },
  fonts: [{
    provider: fontProviders.fontsource(),
    name: 'Inter',
    cssVariable: '--font-inter-var',
    weights: ['300 400 500 600 700 800 900'],
  }],
  vite: {
    plugins: [
      tailwindcss(),
      lightboxProvider(),
    ],
    cacheDir: '.vite-cache',
    build: {
      chunkSizeWarningLimit: 1111,
    },
    ssr: {
      // svgdom and mermaid are Node-only SSR packages used in remark plugins;
      // externalizing them prevents Vite from bundling them and breaking dynamic imports.
      external: ['svgdom', 'mermaid'],
    },
  },
  integrations: [
    icon(),
    mdx({
      syntaxHighlight: false,
      processor: unified({
          remarkPlugins: [
          remarkMdx,
          mermaidTitleFix,      // inserts title nodes before we transform code blocks
          remarkMermaidSSR,     // replaces mermaid blocks with pre-rendered SVGs
          remarkShellSessionPrompts,
        ],
        rehypePlugins: [
          [rehypeCodeMeta, { excludeLangs: ['mermaid'] }],
          rehypeSlug,
          rehypeCopyButton,
          [
            rehypeAutolinkHeadings,
            {
              behavior: 'append',
              content: {
                type: 'text',
                value: '#',
              },
              properties: {
                title: ['link to header'],
                ariaLabel: ['Anchor'],
                class: 'anchor-link !border-b-0 !no-underline ml-2 opacity-0 group-hover:opacity-100'
              },
              headingProperties: {
                class: 'group articleHeading'
              }
            },
          ],
        ],
        smartypants: false,
      })
    }),
    buildSitemap(),
    indexPages(),
    astroToc(),
    genMarkdownPages({
      indexFilter: (url) => url.startsWith('/docs/') || url === '/docs.md',
      categorize: (url) => {
        if (url === '/docs.md') return 'overview';
        const seg = url.split('/')[2]?.replace(/\.md$/, '') ?? '';
        return seg || 'overview';
      },
      formatCategoryName: (key) => {
        const lower = key.toLowerCase();
        if (lower === 'sdks') return 'SDKs';
        if (lower === 'api') return 'API';
        if (lower === 'ciam') return 'CIAM';
        if (lower === 'oauth') return 'OAuth';
        return key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      },
      sortCategories: (names) => names.sort((a, b) => {
        if (a === 'Get Started') return -1;
        if (b === 'Get Started') return 1;
        return a.localeCompare(b);
      }),
      llmsTxtPath: 'docs/llms.txt',
      llmsTxtTitle: 'FusionAuth Documentation',
      llmsTxtDescription: 'Comprehensive documentation for FusionAuth CIAM, APIs, QuickStarts, and custom integrations.',
      trimTitleSuffix: ' | FusionAuth Docs',
      spokesDir: 'docs',
      inlineCategories: ['Overview'],
    }),
    openapiSummary(),
    // only run link validator when not in the 'PROD' environment (just an env var passed to deploy)
    process.env.PROD !== 'true' && linkChecker({
      failOnBrokenLinks: true,
      verbose: false,
      // Pages whose content we don't want to crawl (URL path, prefix string or RegExp)
      excludeSourcePages: [
        '/landing/',
        // Generated from external API; some old versions have no release notes entry
        '/direct-download',
      ],
      // Destinations to skip checking (normalized root-relative path, prefix string or RegExp)
      excludeDestinations: [
        // Routes that only exist at runtime (auth, Flask examples in code blocks)
        '/login', '/logout', '/register', '/user/login', '/user/logout',
        // Pages that live outside the Astro build (marketing site, external tools)
        // No trailing slash — prefix match covers /community and /community/foo
        '/platform', '/cdn', '/dev-tools', '/tech-papers', '/feature', '/features',
        '/webinar', '/community', '/forum', '/compare', '/industry', '/license',
        '/partners', '/video', '/event', '/ebooks', '/glossary', '/guides',
        '/permify-docs',
        '/buildvsbuy', '/auth0-migration', '/aws-reinvent22', '/aws-reinvent23',
        // Standalone marketing / legal pages not in the Astro build
        '/pricing', '/download', '/contact', '/get-started', '/passwordless',
        '/direct-download', '/jobs', '/careers', '/password-history',
        '/partners-form', '/resource/all', '/sso', '/kubernetes',
        '/compare-fusionauth', '/security', '/customers-partners',
        '/license-faq', '/feature-list', '/product-privacy-policy', '/passkeys',
        '/legal/data-processing-addendum.pdf',
        '/auth0-migration',
      ],
    })
  ],
  site: process.env.SITE_URL || 'https://fusionauth.io/',
});

export default config;
