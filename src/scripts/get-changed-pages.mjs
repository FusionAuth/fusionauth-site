#!/usr/bin/env node
/**
 * Outputs "url/title" lines for every deployed page affected by the current PR.
 *
 * Fragment files (underscore-prefixed) are resolved transitively to the real
 * pages that import them, so a change to _shared/_foo.mdx surfaces every page
 * that ultimately uses that fragment. Non-content files and files excluded from
 * Astro's content collections are silently skipped.
 *
 * Environment variables:
 *   BASE_REF  — git ref to diff from (default: origin/main)
 *   HEAD_REF  — git ref to diff to   (default: HEAD)
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = join(dirname(__filename), '..', '..');

const BASE_REF = process.env.BASE_REF || 'origin/main';
const HEAD_REF = process.env.HEAD_REF || 'HEAD';

// ── Changed files ─────────────────────────────────────────────────────────────

const changedFiles = execSync(
  `git -C "${REPO_ROOT}" diff --name-only "${BASE_REF}...${HEAD_REF}"`,
  { encoding: 'utf-8' },
).trim().split('\n').filter(Boolean);

// ── Build reverse import graph ────────────────────────────────────────────────
// Scan every MDX/Astro source file for lines like:
//   import Foo from 'src/content/docs/...'
// The 'src/' alias maps to 'astro/src/', so we prefix 'astro/' to reconstruct
// the repo-relative path.
//
// Result: reverseImports maps each imported file to the Set of files that
// import it — i.e. the graph runs "backward" from dependency to dependents.

const IMPORT_RE = /from\s+['"]src\/(content\/[^'"]+)['"]/g;
/** @type {Map<string, Set<string>>} imported → Set<importer> (repo-relative) */
const reverseImports = new Map();

function scanDir(absDir) {
  if (!existsSync(absDir)) return;
  const files = execSync(
    `find "${absDir}" \\( -name "*.mdx" -o -name "*.astro" \\) -type f`,
    { encoding: 'utf-8' },
  ).trim().split('\n').filter(Boolean);

  for (const absFile of files) {
    const filePath = relative(REPO_ROOT, absFile).replace(/\\/g, '/');
    let text;
    try { text = readFileSync(absFile, 'utf-8'); } catch { continue; }
    for (const m of text.matchAll(IMPORT_RE)) {
      const imported = `astro/src/${m[1]}`;
      if (!reverseImports.has(imported)) reverseImports.set(imported, new Set());
      reverseImports.get(imported).add(filePath);
    }
  }
}

scanDir(join(REPO_ROOT, 'astro', 'src', 'content', 'docs'));
scanDir(join(REPO_ROOT, 'astro', 'src', 'content', 'articles'));
scanDir(join(REPO_ROOT, 'astro', 'src', 'content', 'blog'));
scanDir(join(REPO_ROOT, 'astro', 'src', 'pages'));

// ── Page vs. fragment detection ───────────────────────────────────────────────

function isPage(repoRelPath) {
  const parts = repoRelPath.split('/');
  const filename = parts[parts.length - 1];

  // Any path component starting with '_' → fragment, not a page
  if (parts.some(p => p.startsWith('_'))) return false;

  if (repoRelPath.startsWith('astro/src/content/')) {
    // content.config.js glob: ["**/*.mdx", "!**/_*.mdx", "!**/_*/**/*.mdx"]
    // .astro files in content/ are always component fragments, never pages
    return filename.endsWith('.mdx');
  }

  if (repoRelPath.startsWith('astro/src/pages/')) {
    // Astro dynamic route templates ([...slug].astro etc.) generate pages from
    // collections; the template itself is not an end-page we want to link to.
    if (filename.includes('[')) return false;
    return /\.(mdx?|astro)$/.test(filename);
  }

  return false;
}

// ── Transitive lookup: fragment → all dependent pages ────────────────────────

function pagesUsing(fragmentPath) {
  const result = new Set();
  const visited = new Set();
  const queue = [fragmentPath];
  while (queue.length) {
    const cur = queue.shift();
    if (visited.has(cur)) continue;
    visited.add(cur);
    for (const importer of (reverseImports.get(cur) || [])) {
      if (isPage(importer)) result.add(importer);
      else queue.push(importer); // another fragment — keep traversing
    }
  }
  return result;
}

// ── Frontmatter helpers ───────────────────────────────────────────────────────

const FM_RE = /^---[\r\n]([\s\S]*?)[\r\n]---/;

function parseFrontmatter(repoRelPath) {
  try {
    const text = readFileSync(join(REPO_ROOT, repoRelPath), 'utf-8');
    const m = FM_RE.exec(text);
    return m ? m[1] : '';
  } catch { return ''; }
}

function getTitle(repoRelPath) {
  const fm = parseFrontmatter(repoRelPath);
  const m = /^title:\s*["']?(.+?)["']?\s*$/m.exec(fm);
  if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  return repoRelPath.split('/').pop().replace(/\.[^.]+$/, '').replace(/-/g, ' ');
}

function isDeployed(repoRelPath) {
  const fm = parseFrontmatter(repoRelPath);
  return !/^route:\s*false\s*$/m.test(fm);
}

// ── URL generation ────────────────────────────────────────────────────────────

function getUrl(repoRelPath) {
  const stripExt = p => p.replace(/\.(mdx?|astro)$/, '');
  const normalize = p => {
    if (p === 'index') return '';
    if (p.endsWith('/index')) return p.slice(0, -6);
    return p;
  };
  const build = (prefix, raw) => {
    const p = normalize(stripExt(raw));
    return p ? `${prefix}/${p}` : prefix;
  };

  if (repoRelPath.startsWith('astro/src/content/docs/')) {
    return build('/docs', repoRelPath.replace('astro/src/content/docs/', ''));
  }
  if (repoRelPath.startsWith('astro/src/content/articles/')) {
    return build('/articles', repoRelPath.replace('astro/src/content/articles/', ''));
  }
  if (repoRelPath.startsWith('astro/src/content/blog/')) {
    return build('/blog', repoRelPath.replace('astro/src/content/blog/', ''));
  }
  if (repoRelPath.startsWith('astro/src/pages/')) {
    return build('', repoRelPath.replace('astro/src/pages/', '')) || '/';
  }
  return '/';
}

// ── Main ──────────────────────────────────────────────────────────────────────

const RELEVANT_RE = /^astro\/src\/(content\/(docs|articles|blog)|pages)\//;
const EXT_RE = /\.(md|mdx|astro)$/;

const affected = new Set();

for (const f of changedFiles) {
  if (!RELEVANT_RE.test(f) || !EXT_RE.test(f)) continue;
  if (isPage(f)) {
    affected.add(f);
  } else {
    for (const page of pagesUsing(f)) affected.add(page);
  }
}

for (const page of [...affected].sort()) {
  if (!isDeployed(page)) continue;
  process.stdout.write(`${getUrl(page)}\t${getTitle(page)}\n`);
}
