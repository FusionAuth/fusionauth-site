import {defineConfig, fontProviders} from 'astro/config';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import mdx from "@astrojs/mdx";
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import indexPages from "astro-index-pages/index.js";
import genMarkdownPages from 'astro-gen-markdown-pages';
import { remarkMermaidSSR, mermaidTitleFix } from 'astro-mermaid-renderer-cli-smol';
import remarkMdx from 'remark-mdx';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import linkChecker, { markdownLinkSyntaxChecker } from 'astro-link-checker';
import icon from "astro-iconset";
import { rehypeCodeBlocks, remarkShellSession } from 'astro-better-code-blocks';
import { extractedCodeSnippets } from 'astro-better-code-snippet-extractor';
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


const mdxComponentImports =
  "import APIField from 'src/components/api/APIField.astro';\n" +
  "import APIBlock from 'src/components/api/APIBlock.astro';\n" +
  "import API from 'src/components/api/API.astro';\n" +
  "import AvailableSince from 'src/components/api/AvailableSince.astro';\n" +
  "import DeprecatedSince from 'src/components/api/DeprecatedSince.astro';\n" +
  "import RemovedSince from 'src/components/api/RemovedSince.astro';\n" +
  "import JSON from 'src/components/JSON.astro';\n" +
  "import Breadcrumb from 'src/components/Breadcrumb.astro';\n" +
  "import Aside from 'src/components/Aside.astro';\n" +
  "import RemoteCode from 'src/components/RemoteCode.astro';\n" +
  "import PlanBlurb from 'src/components/plan/PlanBlurb.astro';\n" +
  "import PlanBlurbApi from 'src/components/plan/PlanBlurbApi.astro';\n" +
  "import If from 'src/components/If.astro';\n" +
  "import Icon from 'src/components/icon/Icon.astro';\n" +
  "import IconButton from 'src/components/IconButton.astro';\n" +
  "import ChildCards from 'astro-better-cards/ChildCards.astro';\n" +
  "import Card from 'astro-better-cards/Card.astro';\n" +
  "import ExtractedCode from 'astro-better-code-snippet-extractor/ExtractedCode.astro';\n" +
  "import Tabs from 'astro-better-tabs/Tabs.astro';\n" +
  "import TabItem from 'astro-better-tabs/TabItem.astro';\n" +
  "import Details from 'astro-better-details/Details.astro';\n" +
  "import { Steps } from 'astro-better-steps';\n" +
  "import Table from 'astro-better-tables/Table.astro';\n" +
  "import Screenshot from 'astro-better-declarative-screenshots/Screenshot.astro';\n" +
  "import Highlight from 'astro-better-declarative-screenshots/Highlight.astro';\n" +
  "import MarkdownOnly from 'astro-gen-markdown-pages/MarkdownOnly.astro';\n\n";

// inject imports into MDX source before the MDX compiler runs, so that component
// references compile to direct variable lookups rather than _components map lookups
const mdxComponentImporter = () => ({
  name: 'mdx-component-importer',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.endsWith('.mdx')) return;

    // build identifier -> source map for existing imports
    const declaredMap = new Map<string, string>();
    const importRe = /^import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/gm;
    let m: RegExpExecArray | null;
    while ((m = importRe.exec(code)) !== null) {
      const src = m[3];
      if (m[2]) {
        declaredMap.set(m[2], src);
      } else {
        m[1].split(',').forEach(s => {
          const name = s.trim().split(/\s+as\s+/).pop()?.trim();
          if (name) declaredMap.set(name, src);
        });
      }
    }

    // skip or error per-line depending on whether the conflict is the same source
    const linesToInject = mdxComponentImports.split('\n').filter(line => {
      if (!line.startsWith('import')) return true;
      const nm = line.match(/^import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+['"]([^'"]+)['"]/);
      if (!nm) return true;
      const name = nm[2] ?? nm[1]?.trim().split(/\s+as\s+/).pop()?.trim();
      const autoSrc = nm[3];
      if (!name || !declaredMap.has(name)) return true;

      const fileSrc = declaredMap.get(name)!;
      // same source if exact match or relative path ending in the same file
      const isSameSrc = fileSrc === autoSrc || fileSrc.endsWith('/' + autoSrc.split('/').pop()!);
      if (isSameSrc) {
        throw new Error(
          `[mdx-component-importer] Redundant import in ${id}\n` +
          `  \`${name}\` is auto-imported — remove the explicit import.`
        );
      }
      // different component happens to share the name: skip injection, file's import wins
      return false;
    });

    const injected = linesToInject.join('\n');
    const frontmatter = code.match(/^---[\s\S]*?---[ \t]*\n/);
    if (frontmatter) {
      return code.slice(0, frontmatter[0].length) + injected + code.slice(frontmatter[0].length);
    }
    return injected + code;
  }
});

const lightboxProvider = () => ({
  name: 'mdx-lightbox-provider',
  enforce: 'post' as const,
  transform(code: string, id: string) {
    if (!id.endsWith('.mdx')) return;
    code = `import _LightboxImage from "src/components/LightboxImage.astro";\n${code}`;
    code = code.replace(
      "components: { Fragment: _Fragment, ...props.components, },",
      "components: { Fragment: _Fragment, img: _LightboxImage, ...props.components, },"
    );
    return code;
  }
});

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
      mdxComponentImporter(),
      lightboxProvider(),
    ],
    build: {
      chunkSizeWarningLimit: 700,
    },
    cacheDir: '.vite-cache',
    ssr: {
      // svgdom and mermaid are Node-only SSR packages used in remark plugins;
      // externalizing them prevents Vite from bundling them and breaking dynamic imports.
      external: ['svgdom', 'mermaid'],
    },
  },
  integrations: [
    extractedCodeSnippets({ plugin: 'bluehawk-languages.js' }),
    icon(),
    mdx({
      syntaxHighlight: false,
      processor: unified({
          remarkPlugins: [
          remarkMdx,
          mermaidTitleFix,      // inserts title nodes before we transform code blocks
          remarkMermaidSSR,     // replaces mermaid blocks with pre-rendered SVGs
          remarkShellSession,
        ],
        rehypePlugins: [
          [rehypeCodeBlocks, { excludeLangs: ['mermaid'] }],
          rehypeSlug,
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
    astroToc({ articleSelector: ['article.fusion-article section', 'article.fusion-article', 'article', 'main'] }),
    genMarkdownPages({
      pageFilter: (url) => !url.startsWith('/articles/') && url !== '/articles.md' && !url.startsWith('/blog/'),
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
    genMarkdownPages({
      pageFilter: (url) => url.startsWith('/articles/') || url === '/articles.md',
      indexFilter: (url) => url.startsWith('/articles/') || url === '/articles.md',
      categorize: (url) => {
        if (url === '/articles.md') return 'overview';
        return url.split('/')[2]?.replace(/\.md$/, '') || 'overview';
      },
      formatCategoryName: (key) => {
        const lower = key.toLowerCase();
        if (lower === 'ai') return 'AI';
        if (lower === 'ciam') return 'CIAM';
        if (lower === 'oauth') return 'OAuth';
        if (lower === 'gaming-entertainment') return 'Gaming & Entertainment';
        if (lower === 'login-authentication-workflows') return 'Login & Authentication';
        return key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      },
      sortCategories: (names) => names.sort((a, b) => {
        if (a === 'Overview') return -1;
        if (b === 'Overview') return 1;
        return a.localeCompare(b);
      }),
      docsIndexUrl: 'https://fusionauth.io/docs/llms.txt',
      llmsTxtPath: 'articles/llms.txt',
      llmsTxtTitle: 'FusionAuth Articles',
      llmsTxtDescription: 'In-depth articles on CIAM, authentication, OAuth, and identity management from the FusionAuth team. For technical API and integration documentation, see the [FusionAuth Docs index](https://fusionauth.io/docs/llms.txt).',
      trimTitleSuffix: ' | FusionAuth Docs',
      spokesDir: 'articles',
      inlineCategories: ['Overview'],
    }),
    genMarkdownPages({
      pageFilter: (url) => url.startsWith('/blog/'),
      // Exclude pagination (/blog/2), author, tag, category, and latest pages -- only real posts.
      indexFilter: (url) =>
        url.startsWith('/blog/') &&
        !/^\/blog\/(author|category|tag|latest)(\/|\.md$|$)/.test(url) &&
        !/^\/blog\/\d+\.md$/.test(url),
      categorize: () => 'posts',
      formatCategoryName: () => 'Posts',
      docsIndexUrl: 'https://fusionauth.io/docs/llms.txt',
      llmsTxtPath: 'blog/llms.txt',
      llmsTxtTitle: 'FusionAuth Blog',
      llmsTxtDescription: 'News, tutorials, comparisons, and technical content from the FusionAuth team. For technical API and integration documentation, see the [FusionAuth Docs index](https://fusionauth.io/docs/llms.txt).',
    }),
    openapiSummary(),
    // only run link validators when not in a preview/deploy build
    process.env.PROD !== 'true' && markdownLinkSyntaxChecker(),
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
        '/lp/state-of-ai-and-identity',
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
