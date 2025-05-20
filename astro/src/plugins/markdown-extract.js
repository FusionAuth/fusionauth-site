// src/plugins/markdown-extract.ts
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

async function renderAstroComponent(filePath) {
  const content = await fs.readFile(filePath, "utf8");
  return content.replace(/^---[\s\S]*?---/, "").trim();
}

function shouldInline(importPath) {
  return (
    importPath.startsWith("src/content") ||
    importPath.startsWith("src/diagrams")
  );
}

const importRegex = /^\s*import\s+.*?['"](.+?\.mdx?)['"]\s*;?\s*$/gm;

/**
 * Recursively inlines imports from .md/.mdx files
 * @param {string} filePath - Absolute path to the initial file
 * @param {Set<string>} seen - Tracks files already inlined to avoid cycles
 * @returns {string} - Final inlined content
 */
function inlineMarkdownImports(filePath, seen = new Set()) {
  if (seen.has(filePath)) {
    console.warn(`Skipping already inlined file: ${filePath}`);
    return '';
  }

  seen.add(filePath);

  let content = fs.readFileSync(filePath, 'utf-8');

  content = content.replace(importRegex, (match, importPath) => {
    const baseDir = "";
    const resolvedPath = path.resolve(baseDir, importPath);
    console.log(resolvedPath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`Import not found: ${resolvedPath}`);
      return `<!-- Missing import: ${importPath} -->`;
    }

    const inlined = inlineMarkdownImports(resolvedPath, seen);
    return `<!-- Inlined from ${importPath} -->\n${inlined}`;
  });

  return content;
}


export default function markdownExtractIntegration() {
  const pageMap = new Map(); // Map pathname -> file path
  return {
    name: 'markdown-extract',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        console.log('Copying content collection entries...');
        const contentDir = path.resolve('./src/content/docs');
        const contentFiles = walk(contentDir);

        for (const file of contentFiles) {
          // console.log(file);
          const relPath = path.relative(contentDir, file);
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

