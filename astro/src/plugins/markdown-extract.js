import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

function htmlToLLMMarkdown(htmlString) {
  const $ = cheerio.load(htmlString);
  
  let containerNode = $('article').first();
  if (!containerNode.length) containerNode = $('main').first();
  if (!containerNode.length) containerNode = $('body').first();
  
  if (!containerNode.length) return '';

  const title = $('meta[property="og:title"]').attr('content') || $('title').text();
  const description = $('meta[name="description"]').attr('content') || '';

  containerNode.find('script, style, svg, button, .not-prose.hidden, nav, footer, aside').remove();

  const rawHtml = containerNode.html();
  const markdownContent = turndownService.turndown(rawHtml);

  let output = `> For the complete documentation index, see [llms.txt](/docs/llms.txt)\n\n`;
  if (title) output += `# ${title}\n\n`;
  if (description) output += `${description}\n\n`;
  
  output += markdownContent;
  return output;
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

// Helper to format a folder like "get-started" into "Get Started"
function formatCategoryName(folderName) {
  if (!folderName || folderName.endsWith('.md')) return 'Overview';
  
  // Handle common acronyms
  const lower = folderName.toLowerCase();
  if (lower === 'sdks') return 'SDKs';
  if (lower === 'api') return 'API';
  if (lower === 'ciam') return 'CIAM';
  if (lower === 'oauth') return 'OAuth';
  
  // Capitalize hyphenated words
  return folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function markdownExtractIntegration() {
  return {
    name: 'html-to-markdown-llm',
    hooks: {
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
                const mdString = htmlToLLMMarkdown(htmlString);
                
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
        
        // Use a Map to group links by their top-level category
        const docsCategories = new Map();

        for (const htmlFile of htmlFiles) {
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

          const mdContent = htmlToLLMMarkdown(htmlContent);
          if (!mdContent) continue; 

          const mdFilePath = htmlFile.replace(/\.html$/, '.md');
          fs.writeFileSync(mdFilePath, mdContent, 'utf-8');

          if (mdPublicUrl.startsWith('/docs/')) {
            const $ = cheerio.load(htmlContent);
            const title = $('meta[property="og:title"]').attr('content') || $('title').text().split('|')[0].trim();
            const description = $('meta[name="description"]').attr('content') || '';
            const descText = description ? `: ${description}` : '';
            
            // Extract the top-level directory (e.g., ['', 'docs', 'get-started', 'page.md'])
            const pathParts = mdPublicUrl.split('/');
            const folderName = pathParts[2];
            const categoryName = formatCategoryName(folderName);

            if (!docsCategories.has(categoryName)) {
              docsCategories.set(categoryName, []);
            }
            docsCategories.get(categoryName).push(`- [${title}](${mdPublicUrl})${descText}`);
          }
        }

        // Now, assemble the llms.txt content using the grouped categories
        let llmsTxt = `# FusionAuth Documentation\n\n`;
        llmsTxt += `> Comprehensive documentation for FusionAuth CIAM, APIs, Quickstarts, and custom integrations.\n\n`;

        // Ensure "Overview" (root-level docs) appears first if it exists
        if (docsCategories.has('Overview')) {
          llmsTxt += `## Overview\n\n${docsCategories.get('Overview').join('\n')}\n\n`;
          docsCategories.delete('Overview');
        }

        // Sort the remaining categories alphabetically and append them
        const sortedCategories = Array.from(docsCategories.keys()).sort();
        for (const cat of sortedCategories) {
          llmsTxt += `## ${cat}\n\n${docsCategories.get(cat).join('\n')}\n\n`;
        }

        const docsDir = path.join(distDir, 'docs');
        fs.mkdirSync(docsDir, { recursive: true });
        fs.writeFileSync(path.join(docsDir, 'llms.txt'), llmsTxt, 'utf-8');
        
        const wellKnownDir = path.join(docsDir, '.well-known');
        fs.mkdirSync(wellKnownDir, { recursive: true });
        fs.writeFileSync(path.join(wellKnownDir, 'llms.txt'), llmsTxt, 'utf-8');

        console.log(`Successfully synced HTML links and generated categorized llms.txt!`);
      }
    }
  };
}