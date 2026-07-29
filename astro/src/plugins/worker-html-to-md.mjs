import { workerData, parentPort } from 'node:worker_threads';
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

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

function formatCategoryName(folderName) {
  if (!folderName || folderName.endsWith('.md')) return 'Overview';
  const lower = folderName.toLowerCase();
  if (lower === 'sdks') return 'SDKs';
  if (lower === 'api') return 'API';
  if (lower === 'ciam') return 'CIAM';
  if (lower === 'oauth') return 'OAuth';
  return folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function processFile(htmlFile, distDir) {
  let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
  const relPath = path.relative(distDir, htmlFile);
  const mdPublicUrl = `/${relPath.replace(/\.html$/, '.md').replace(/\\/g, '/')}`;

  let htmlChanged = false;
  if (htmlContent.includes('id="llm-md-link"')) {
    htmlContent = htmlContent.replace(
      /<link\s+id="llm-md-link"\s+([^>]+)?href="([^"]+)"([^>]*)>/,
      () => `<link rel="alternate" type="text/markdown" title="Page Markdown Source" href="${mdPublicUrl}">`
    );
    htmlChanged = true;
  }
  if (htmlContent.includes('LLM_MD_PATH_PLACEHOLDER')) {
    htmlContent = htmlContent.replaceAll('LLM_MD_PATH_PLACEHOLDER', mdPublicUrl);
    htmlChanged = true;
  }
  if (htmlChanged) {
    fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
  }

  // Single cheerio parse for both markdown generation and llms.txt metadata
  const $ = cheerio.load(htmlContent);

  let containerNode = $('article').first();
  if (!containerNode.length) containerNode = $('main').first();
  if (!containerNode.length) containerNode = $('body').first();
  if (!containerNode.length) return null;

  const title = $('meta[property="og:title"]').attr('content') || $('title').text().split('|')[0].trim();
  const description = $('meta[name="description"]').attr('content') || '';

  containerNode.find('.tab-panel').removeClass('hidden');
  containerNode.find(`
    script, style, svg, button, nav, footer, aside,
    .not-prose.hidden, [aria-hidden="true"], .hidden, .sr-only, dialog, noscript
  `).remove();

  const rawHtml = containerNode.html();
  if (!rawHtml) return null;

  const markdownContent = turndownService.turndown(rawHtml);

  let output = `> For the complete documentation index, see [llms.txt](/docs/llms.txt)\n\n`;
  if (title) output += `# ${title}\n\n`;
  if (description) output += `${description}\n\n`;
  output += markdownContent;

  fs.writeFileSync(htmlFile.replace(/\.html$/, '.md'), output, 'utf-8');

  if (mdPublicUrl.startsWith('/docs/')) {
    const descText = description ? `: ${description}` : '';
    const categoryName = formatCategoryName(mdPublicUrl.split('/')[2]);
    return { categoryName, entry: `- [${title}](${mdPublicUrl})${descText}` };
  }
  return null;
}

const { files, distDir } = workerData;
const results = [];
for (const htmlFile of files) {
  try {
    const result = processFile(htmlFile, distDir);
    if (result) results.push(result);
  } catch (_) {
    // skip files that fail processing
  }
}

parentPort.postMessage(results);
