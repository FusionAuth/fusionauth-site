import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function extractFrontmatter(markdown) {
  const frontmatterMatch = markdown.match(/^---([\s\S]*?)---/);
  if (!frontmatterMatch) return { title: null, description: null, content: markdown };

  const fmContent = frontmatterMatch[1];
  const contentWithoutFM = markdown.slice(frontmatterMatch[0].length).trimStart();

  const lines = fmContent.split(/\r?\n/);
  let title = null;
  let description = null;

  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (!key) continue;
    const value = rest.join(':').trim();

    if (key.trim() === 'title') title = value;
    if (key.trim() === 'description') description = value;
  }

  return { title, description, content: contentWithoutFM };
}

function walk(dir, extFilter = ['.md', '.mdx']) {
  const results = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...walk(fullPath, extFilter));
    } else if (!entry.name.startsWith('_') && extFilter.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

const importRegex = /^\s*import\s+.*?['"](.+?)['"]\s*;?\s*$/gm;

function inlineMarkdownImports(filePath, seen = new Set()) {
  if (seen.has(filePath)) {
    console.warn(`Skipping already inlined file: ${filePath}`);
    return '';
  }

  seen.add(filePath);

  let content = fs.readFileSync(filePath, 'utf-8');
  const importMap = new Map();

  content = content.replace(importRegex, (match, importPath) => {
    const importNameMatch = match.match(/import\s+(\w+)\s+from/);
    if (!importNameMatch) return '';

    const importName = importNameMatch[1];
    const resolvedPath = path.resolve('./', importPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Import not found: ${resolvedPath}`);
      return `<!-- Missing import: ${importPath} -->`;
    }

    if (resolvedPath.includes(path.normalize('/src/content/'))) {
      importMap.set(importName, resolvedPath);
    }

    return '';
  });

  for (const [name, resolvedPath] of importMap.entries()) {
    const componentTagRegex = new RegExp(`<${name}(\\s*[^>]*)?\\s*/>`, 'g');
    const inlinedContent = inlineMarkdownImports(resolvedPath, seen);
    content = content.replace(
      componentTagRegex,
      inlinedContent
    );
  }

  const { title, description, content: bodyContent } = extractFrontmatter(content);

  let header = '';
  if (title) header += `# ${title}\n\n`;
  if (description) header += `${description}\n\n`;

  return header + bodyContent;
}

function rewritePath(relPath) {
  if (relPath.endsWith('/index.mdx') || relPath.endsWith('/index.md')) {
    return relPath.replace(/\/index\.(mdx|md)$/, '.md');
  }
  if (relPath.endsWith('.mdx')) {
    return relPath.replace(/\.mdx$/, '.md');
  }
  return relPath;
}

function generateLlmsTxt(contentFiles, contentDir) {
  let output = `# FusionAuth Documentation\n\n`;
  output += `> Comprehensive documentation for FusionAuth CIAM, APIs, Quickstarts, and custom integrations.\n\n`;
  output += `## Core Documentation\n\n`;

  for (const file of contentFiles) {
    const rawContent = fs.readFileSync(file, 'utf-8');
    const { title, description } = extractFrontmatter(rawContent);

    const relPath = rewritePath(path.relative(contentDir, file));
    const publicUrl = `/docs/${relPath}`;

    const linkTitle = title || path.basename(relPath, '.md');
    const descText = description ? `: ${description}` : '';

    output += `- [${linkTitle}](${publicUrl})${descText}\n`;
  }

  return output;
}

export default function markdownExtractIntegration() {
  return {
    name: 'markdown-extract',
    hooks: {
      // 1. Dev Mode: Serve /docs/llms.txt and /docs/.well-known/llms.txt
      'astro:server:setup': ({ server }) => {
        server.middlewares.use((req, res, next) => {
          if (
            req.url === '/docs/llms.txt' || 
            req.url === '/docs/.well-known/llms.txt'
          ) {
            const contentDir = path.resolve('./src/content/docs');
            const contentFiles = walk(contentDir);
            const llmsContent = generateLlmsTxt(contentFiles, contentDir);

            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(llmsContent);
            return;
          }

          if (req.url && req.url.startsWith('/docs/') && req.url.endsWith('.md')) {
            const contentDir = path.resolve('./src/content/docs');
            const subPath = req.url.replace('/docs/', '').replace(/\.md$/, '');
            let sourceFile = path.join(contentDir, `${subPath}.mdx`);
            if (!fs.existsSync(sourceFile)) {
              sourceFile = path.join(contentDir, `${subPath}.md`);
            }
            if (!fs.existsSync(sourceFile)) {
              sourceFile = path.join(contentDir, subPath, 'index.mdx');
            }

            if (fs.existsSync(sourceFile)) {
              const inlinedContent = inlineMarkdownImports(sourceFile);
              res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
              res.end(inlinedContent);
              return;
            }
          }
          next();
        });
      },

      // 2. Build Mode: Write static .md files + /docs/llms.txt into dist/
      'astro:build:done': async ({ dir }) => {
        console.log('Generating markdown docs and /docs/llms.txt...');
        const distDir = typeof dir === 'string' 
          ? dir 
          : (dir instanceof URL ? fileURLToPath(dir) : fileURLToPath(new URL(dir)));

        const contentDir = path.resolve('./src/content/docs');
        const contentFiles = walk(contentDir);

        for (const file of contentFiles) {
          const relPath = rewritePath(path.relative(contentDir, file));
          const outPath = path.join(distDir, 'docs', relPath);
          const inlinedContent = inlineMarkdownImports(file);

          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, inlinedContent, 'utf-8');
        }

        const llmsContent = generateLlmsTxt(contentFiles, contentDir);
        const docsDir = path.join(distDir, 'docs');

        // Write /docs/llms.txt
        fs.writeFileSync(path.join(docsDir, 'llms.txt'), llmsContent, 'utf-8');

        // Write /docs/.well-known/llms.txt
        const docsWellKnownDir = path.join(docsDir, '.well-known');
        fs.mkdirSync(docsWellKnownDir, { recursive: true });
        fs.writeFileSync(path.join(docsWellKnownDir, 'llms.txt'), llmsContent, 'utf-8');

        console.log('Wrote /docs/llms.txt and /docs/.well-known/llms.txt successfully!');
      }
    }
  };
}