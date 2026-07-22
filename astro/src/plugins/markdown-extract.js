import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Configure Turndown to handle GitHub Flavored Markdown (tables, etc.)
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
turndownService.use(gfm);

// Custom rule to ensure quickstart cards (and other link wrappers) become nice markdown links
turndownService.addRule('cardsToLinks', {
  filter: (node) => {
    // If it's an anchor tag that just wraps an image/icon and some text, format it cleanly
    return node.nodeName === 'A' && node.getAttribute('href');
  },
  replacement: (content, node) => {
    const href = node.getAttribute('href');
    const text = node.textContent.trim().replace(/\s+/g, ' ');
    return text ? `[${text}](${href})` : '';
  }
});

/**
 * Extracts the main article content from a full HTML string and converts it to Markdown.
 */
function htmlToLLMMarkdown(htmlString, pageUrlPath) {
  const $ = cheerio.load(htmlString);
  
  // Target the specific article container from your layout
  // (Adjust this selector if your main content lives elsewhere)
  const articleNode = $('article').first();
  
  if (!articleNode.length) {
    return '';
  }

  // Extract meta title and description for the frontmatter / header
  const title = $('meta[property="og:title"]').attr('content') || $('title').text();
  const description = $('meta[name="description"]').attr('content') || '';

  // Remove elements we don't want the LLM to read (buttons, scripts, SVGs used for styling)
  articleNode.find('script, style, svg, button, .not-prose.hidden').remove();

  const rawHtml = articleNode.html();
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

export default function markdownExtractIntegration() {
  return {
    name: 'html-to-markdown-llm',
    hooks: {
      'astro:server:setup': ({ server }) => {
        // Dev Mode: Intercept /docs/**/*.md and generate it on the fly
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/docs/llms.txt' || req.url === '/docs/.well-known/llms.txt') {
            // Note: In dev mode, scanning for all pages dynamically to build the index
            // is complex without Astro's manifest. Best to just link them to the local dev server.
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(`# FusionAuth Docs (Dev Mode)\n\nRun the production build to generate the full llms.txt index.`);
            return;
          }

          if (req.url && req.url.startsWith('/docs/') && req.url.endsWith('.md')) {
            try {
              // Convert the .md request back to the .html route
              const htmlRoute = req.url.replace(/\.md$/, '');
              
              // Fetch the HTML directly from our own running dev server
              const devServerUrl = `http://${req.headers.host}${htmlRoute}`;
              const response = await fetch(devServerUrl);
              
              if (response.ok) {
                const htmlString = await response.text();
                const mdString = htmlToLLMMarkdown(htmlString, htmlRoute);
                
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

      'astro:build:done': async ({ dir, pages }) => {
        console.log('Post-processing HTML into LLM-friendly Markdown...');
        const distDir = typeof dir === 'string' 
          ? dir 
          : (dir instanceof URL ? fileURLToPath(dir) : fileURLToPath(new URL(dir)));
        
        const docsDir = path.join(distDir, 'docs');
        if (!fs.existsSync(docsDir)) return;

        const htmlFiles = walkHtmlFiles(docsDir);
        
        let llmsTxt = `# FusionAuth Documentation\n\n`;
        llmsTxt += `> Comprehensive documentation for FusionAuth CIAM, APIs, Quickstarts, and custom integrations.\n\n`;
        llmsTxt += `## Core Documentation\n\n`;

        for (const htmlFile of htmlFiles) {
          const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
          const relPath = path.relative(docsDir, htmlFile);
          
          // Generate the markdown equivalent
          const mdContent = htmlToLLMMarkdown(htmlContent, relPath);
          if (!mdContent) continue; // Skip if no <article> tag was found

          // Save the .md file right next to the .html file
          const mdFilePath = htmlFile.replace(/\.html$/, '.md');
          fs.writeFileSync(mdFilePath, mdContent, 'utf-8');

          // Extract title/desc for the index using cheerio
          const $ = cheerio.load(htmlContent);
          const title = $('meta[property="og:title"]').attr('content') || $('title').text().split('|')[0].trim();
          const description = $('meta[name="description"]').attr('content') || '';
          
          const publicUrl = `/docs/${relPath.replace(/\.html$/, '.md').replace(/\\/g, '/')}`;
          const descText = description ? `: ${description}` : '';
          
          llmsTxt += `- [${title}](${publicUrl})${descText}\n`;
        }

        // Write the index files
        fs.writeFileSync(path.join(docsDir, 'llms.txt'), llmsTxt, 'utf-8');
        
        const wellKnownDir = path.join(docsDir, '.well-known');
        fs.mkdirSync(wellKnownDir, { recursive: true });
        fs.writeFileSync(path.join(wellKnownDir, 'llms.txt'), llmsTxt, 'utf-8');

        console.log(`Successfully generated ${htmlFiles.length} Markdown files and llms.txt!`);
      }
    }
  };
}