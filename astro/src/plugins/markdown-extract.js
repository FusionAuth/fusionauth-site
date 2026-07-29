import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dirname, 'worker-html-to-md.mjs');

function runWorker(files, distDir, siteUrl) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(WORKER_PATH, { workerData: { files, distDir, siteUrl } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
turndownService.use(gfm);

turndownService.addRule('cardsToLinks', {
  filter: (node) => node.nodeName === 'A' && node.getAttribute('href'),
  replacement: (content, node) => {
    const href = node.getAttribute('href');
    const text = node.textContent.trim().replace(/\s+/g, ' ');
    return text ? `[${text}](${href})` : '';
  }
});

turndownService.addRule('tabLabels', {
  filter: (node) => node.nodeName === 'LABEL' && (node.getAttribute('class') || '').includes('tab-label'),
  replacement: (content) => `\n### ${content.trim()}\n\n`
});

function processLinks(markdown, siteUrl) {
  if (!siteUrl) return markdown;
  // Step 1: absolutize root-relative links (skip protocol-relative //cdn.example.com)
  let result = markdown.replace(/\]\(\/(?!\/)/g, `](${siteUrl}/`);
  // Step 2: add .md to internal links whose last path segment has no file extension
  // Matches: ](https://site.com/docs/page) and ](https://site.com/docs/page#frag)
  // Skips: ](https://site.com/img/photo.png) — dot in last segment → no match
  const esc = siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return result.replace(
    new RegExp(`\\]\\((${esc}/[^).#?]+(?:/[^).#?]+)*)(#[^)]*)?\\)`, 'g'),
    (_, path, frag) => `](${path}.md${frag || ''})`,
  );
}

function htmlToLLMMarkdown(htmlString, siteUrl = '') {
  const $ = cheerio.load(htmlString);

  let containerNode = $('article').first();
  if (!containerNode.length) containerNode = $('main').first();
  if (!containerNode.length) containerNode = $('body').first();

  if (!containerNode.length) return '';

  const title = $('meta[property="og:title"]').attr('content') || $('title').text();
  const description = $('meta[name="description"]').attr('content') || '';

  // remove the 'hidden' class from tab panels, we actually want this in markdown output
  containerNode.find('.tab-panel').removeClass('hidden');

  // Removes hidden tabs, SVGs, mobile menus, aria-hidden junk, AND the .sr-only LLM directive
  containerNode.find(`
    script, style, svg, button, nav, footer, aside,
    .not-prose.hidden, [aria-hidden="true"], .hidden, .sr-only, dialog, noscript
  `).remove();

  const rawHtml = containerNode.html();
  const markdownContent = turndownService.turndown(rawHtml);

  let output = `> For the complete documentation index, see [llms.txt](${siteUrl}/docs/llms.txt)\n\n`;
  if (title) output += `# ${title}\n\n`;
  if (description) output += `${description}\n\n`;

  output += markdownContent;
  return processLinks(output, siteUrl);
}

function walkHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(fullPath));
    } else if (entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}


export default function markdownExtractIntegration() {
  let siteUrl = '';

  return {
    name: 'html-to-markdown-llm',
    hooks: {
      'astro:config:done': ({ config }) => {
        siteUrl = (config.site || '').replace(/\/$/, '');
      },

      'astro:server:setup': ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/docs/llms.txt' || req.url === '/docs/.well-known/llms.txt') {
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(`# FusionAuth Docs (Dev Mode)\n\nRun the production build to generate the full llms.txt index.`);
            return;
          }

          if (req.url && req.url.includes('?format=md')) {
            try {
              const htmlRoute = req.url.split('?')[0];
              const devServerUrl = `http://${req.headers.host}${htmlRoute}`;
              const response = await fetch(devServerUrl);

              if (response.ok) {
                const htmlString = await response.text();
                const devSiteUrl = `http://${req.headers.host}`;
                const mdString = htmlToLLMMarkdown(htmlString, devSiteUrl);

                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
                res.end(mdString);
                return;
              }
            } catch (err) {
              console.error(`Error generating MD for ${req.url}:`, err);
            }
          }
          next();
        });
      },

      'astro:build:done': async ({ dir }) => {
        console.log('Post-processing HTML into LLM-friendly Markdown...');
        const distDir = typeof dir === 'string'
          ? dir
          : (dir instanceof URL ? fileURLToPath(dir) : fileURLToPath(new URL(dir)));

        const htmlFiles = walkHtmlFiles(distDir);
        const docsCategories = new Map();

        // Distribute files across worker threads for parallel processing
        const numWorkers = Math.max(1, Math.min(os.cpus().length, htmlFiles.length));
        const chunkSize = Math.ceil(htmlFiles.length / numWorkers);
        const chunks = Array.from({ length: numWorkers }, (_, i) =>
          htmlFiles.slice(i * chunkSize, (i + 1) * chunkSize)
        ).filter(chunk => chunk.length > 0);

        const allResults = (await Promise.all(chunks.map(chunk => runWorker(chunk, distDir, siteUrl)))).flat();

        for (const result of allResults) {
          if (!result) continue;
          const { categoryName, entry } = result;
          if (!docsCategories.has(categoryName)) docsCategories.set(categoryName, []);
          docsCategories.get(categoryName).push(entry);
        }
        
        const docsDir = path.join(distDir, 'docs');
        fs.mkdirSync(docsDir, { recursive: true });
        
        let rootLlmsTxt = `# FusionAuth Documentation\n\n> Comprehensive documentation for FusionAuth CIAM, APIs, Quickstarts, and custom integrations.\n\n## Documentation Sections\n\n`;
        
        // Ensure "Overview" links are placed directly in the root file
        if (docsCategories.has('Overview')) {
          rootLlmsTxt += docsCategories.get('Overview').join('\n') + '\n\n';
          docsCategories.delete('Overview');
        }

        // For all other categories, create a separate sub-index file
        const sortedCategories = Array.from(docsCategories.keys()).sort();
        for (const cat of sortedCategories) {
          const safeFileName = `llms-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
          const catFilePath = path.join(docsDir, safeFileName);
          
          const catLlmsTxt = `# ${cat} Documentation\n\n${docsCategories.get(cat).join('\n')}\n`;
          fs.writeFileSync(catFilePath, catLlmsTxt, 'utf-8');
          
          // Add a link from the root index to this sub-index
          rootLlmsTxt += `- [${cat} Documentation](${siteUrl}/docs/${safeFileName})\n`;
        }

        // Save the root index
        fs.writeFileSync(path.join(docsDir, 'llms.txt'), rootLlmsTxt, 'utf-8');
        
        const wellKnownDir = path.join(docsDir, '.well-known');
        fs.mkdirSync(wellKnownDir, { recursive: true });
        fs.writeFileSync(path.join(wellKnownDir, 'llms.txt'), rootLlmsTxt, 'utf-8');

        console.log(`Successfully synced HTML links and generated hub-and-spoke llms.txt!`);
      }
    }
  };
}