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
  if (!folderName) return 'Overview';
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

const { files, distDir, siteUrl } = workerData;

function transformUrl(url) {
  if (url.startsWith('/') && !url.startsWith('//')) url = siteUrl + url;
  if (!url.startsWith(`${siteUrl}/`)) return url;
  const hashIdx = url.indexOf('#');
  const fragment = hashIdx >= 0 ? url.slice(hashIdx) : '';
  const bare = (hashIdx >= 0 ? url.slice(0, hashIdx) : url).replace(/\/$/, '');
  const lastSegment = bare.split('/').pop() || '';
  return lastSegment.includes('.') ? url : `${bare}.md${fragment}`;
}

function processLinks(markdown) {
  if (!siteUrl) return markdown;
  return markdown.replace(/\]\(([^)]+)\)/g, (_, url) => `](${transformUrl(url)})`);
}

function processFile(htmlFile) {
  let htmlContent = fs.readFileSync(htmlFile, 'utf-8');
  const relPath = path.relative(distDir, htmlFile).replace(/\\/g, '/');
  // foo/index.html represents the directory itself → write as foo.md, not foo/index.md
  const mdRelPath = relPath.endsWith('/index.html')
    ? relPath.slice(0, -'/index.html'.length) + '.md'
    : relPath.replace(/\.html$/, '.md');
  const mdPublicUrl = `/${mdRelPath}`;

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

  let output = `> For the complete documentation index, see [llms.txt](${siteUrl}/docs/llms.txt)\n\n`;
  if (title) output += `# ${title}\n\n`;
  if (description) output += `${description}\n\n`;
  output += markdownContent;

  output = processLinks(output);

  fs.writeFileSync(path.join(distDir, mdRelPath), output, 'utf-8');

  if (mdPublicUrl.startsWith('/docs/') || mdPublicUrl === '/docs.md') {
    const descText = description ? `: ${description}` : '';
    const rawSegment = mdPublicUrl === '/docs.md' ? '' : mdPublicUrl.split('/')[2];
    const segment = rawSegment ? rawSegment.replace(/\.md$/, '') : '';
    const categoryName = formatCategoryName(segment);
    return { categoryName, entry: `- [${title}](${siteUrl}${mdPublicUrl})${descText}` };
  }
  return null;
}

const results = [];
for (const htmlFile of files) {
  try {
    const result = processFile(htmlFile);
    if (result) results.push(result);
  } catch {
    // skip files that fail processing
  }
}

parentPort.postMessage(results);
