// src/plugins/markdown-extract.ts
import fs from 'node:fs';
import path from 'node:path';

function extractFrontmatter(markdown) {
  const frontmatterMatch = markdown.match(/^---([\s\S]*?)---/);
  if (!frontmatterMatch) return { title: null, description: null, content: markdown };

  const fmContent = frontmatterMatch[1];
  const contentWithoutFM = markdown.slice(frontmatterMatch[0].length).trimStart();

  // Simple frontmatter parse for title and description (YAML-ish)
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
    // console.log('processing: '+entry.name);

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

  // Map of import name => file path (only for inlining)
  const importMap = new Map();

  // Strip ALL import statements, but collect paths we care about
  content = content.replace(importRegex, (match, importPath) => {
    const importNameMatch = match.match(/import\s+(\w+)\s+from/);
    if (!importNameMatch) return ''; // remove malformed import

    const importName = importNameMatch[1];
    const resolvedPath = path.resolve('./', importPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Import not found: ${resolvedPath}`);
      return `<!-- Missing import: ${importPath} -->`;
    }

    // Only inline if it's in src/diagrams or src/content
    if (
      resolvedPath.includes(path.normalize('/src/diagrams/')) ||
      resolvedPath.includes(path.normalize('/src/content/'))
    ) {
      importMap.set(importName, resolvedPath);
    }

    // Regardless of whether we inline, we remove the import line
    return '';
  });

  // Replace usages of inlined components with their content
  for (const [name, resolvedPath] of importMap.entries()) {
    const componentTagRegex = new RegExp(`<${name}(\\s*[^>]*)?\\s*/>`, 'g');
    const inlinedContent = inlineMarkdownImports(resolvedPath, seen);
    content = content.replace(
      componentTagRegex,
      `<!-- Inlined from ${resolvedPath} -->\n${inlinedContent}`
    );
  }

  const { title, description, content: bodyContent } = extractFrontmatter(content);

  let header = '';
  if (title) header += `# ${title}\n\n`;
  if (description) header += `${description}\n\n`;

  return header + bodyContent;

}

function rewritePath(relPath) {
  if (relPath.endsWith('/index.mdx')) {
    return relPath.replace(/\/index\.mdx$/, '.mdx');
  }
  return relPath;
}


export default function markdownExtractIntegration() {
  return {
    name: 'markdown-extract',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        console.log('Copying content collection entries...');
        const contentDir = path.resolve('./src/content/docs');
        const contentFiles = walk(contentDir);

        for (const file of contentFiles) {
          // console.log(file);
          const relPath = rewritePath(path.relative(contentDir, file));
          const outPath = path.join(dir.pathname || dir,'docs', relPath);
          const inlinedContent = inlineMarkdownImports(file);

          fs.mkdirSync(path.dirname(outPath), { recursive: true });
          fs.writeFileSync(outPath, inlinedContent, 'utf-8');
          // fs.copyFileSync(file, outPath);
          console.log(`Wrote content: ${relPath}`);
        }
      }
    }
  }
}

