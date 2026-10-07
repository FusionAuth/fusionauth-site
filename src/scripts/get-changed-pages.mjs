#!/usr/bin/env node
/**
 * Outputs "url<TAB>title<TAB>kind" lines for every deployed page affected by the current PR.
 *
 * Builds a dependency graph of astro/src (imports, `layout:` frontmatter, and the components
 * astro.config.ts auto-imports into MDX) and walks it backward from each changed file to the
 * pages that render it. A dynamic route that calls getCollection('docs'|'articles'|'blog')
 * expands to every page in that collection. A changed file under astro/extractedcode maps to
 * the pages whose <ExtractedCode> renders it.
 *
 * kind is "edited" when the page's own content changed (the page file, or a content fragment it
 * includes) and "shared" when it was reached through a component, layout, route, or code sample.
 * Edited pages come first.
 *
 * Environment variables:
 *   BASE_REF  - git ref to diff from (default: origin/main)
 *   HEAD_REF  - git ref to diff to   (default: HEAD)
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname, posix } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC = 'astro/src';

const BASE_REF = process.env.BASE_REF || 'origin/main';
const HEAD_REF = process.env.HEAD_REF || 'HEAD';

const COLLECTIONS = ['docs', 'articles', 'blog'];
const SCANNED_EXT = /\.(astro|mdx|md|ts|tsx|js|jsx|mjs)$/;
const RESOLVE_EXT = ['', '.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.mdx', '.md', '.json'];

const textCache = new Map();
const read = (f) => {
  if (!textCache.has(f)) {
    try { textCache.set(f, readFileSync(join(REPO_ROOT, f), 'utf-8')); } catch { textCache.set(f, ''); }
  }
  return textCache.get(f);
};
const isFile = (f) => { try { return statSync(join(REPO_ROOT, f)).isFile(); } catch { return false; } };

// ── Changed files ─────────────────────────────────────────────────────────────

const changedFiles = execSync(
  `git -C "${REPO_ROOT}" diff --name-only "${BASE_REF}...${HEAD_REF}"`,
  { encoding: 'utf-8' },
).trim().split('\n').filter(Boolean);

// ── Source files ──────────────────────────────────────────────────────────────

function listFiles(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of readdirSync(join(REPO_ROOT, d), { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === 'generated-code-snippets' || e.name.startsWith('.')) continue;
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (SCANNED_EXT.test(e.name)) out.push(p);
    }
  };
  if (existsSync(join(REPO_ROOT, dir))) walk(dir);
  return out;
}

const sourceFiles = listFiles(SRC);
const mdxFiles = sourceFiles.filter(f => /\.mdx?$/.test(f));

// ── Dependency graph ──────────────────────────────────────────────────────────

/** @type {Map<string, Set<string>>} dependency -> files that depend on it (repo-relative) */
const dependents = new Map();
const addEdge = (dependency, dependent) => {
  if (!dependents.has(dependency)) dependents.set(dependency, new Set());
  dependents.get(dependency).add(dependent);
};

// 'src/...' and '/src/...' are aliases for astro/src; relative specifiers resolve from the importer
function resolveSpecifier(spec, importer) {
  let base;
  if (spec.startsWith('src/')) base = `astro/${spec}`;
  else if (spec.startsWith('/src/')) base = `astro${spec}`;
  else if (spec.startsWith('./') || spec.startsWith('../')) base = posix.normalize(posix.join(posix.dirname(importer), spec));
  else return null;
  for (const ext of RESOLVE_EXT) if (isFile(base + ext)) return base + ext;
  for (const ext of RESOLVE_EXT.slice(1)) if (isFile(`${base}/index${ext}`)) return `${base}/index${ext}`;
  return null;
}

const IMPORT_RES = [
  /\bfrom\s+['"]([^'"]+)['"]/g,
  /\bimport\s+['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  /^layout:\s*['"]?([^'"\s]+)['"]?\s*$/gm,
];

for (const file of sourceFiles) {
  const text = read(file);
  for (const re of IMPORT_RES) {
    for (const m of text.matchAll(re)) {
      const target = resolveSpecifier(m[1], file);
      if (target) addEdge(target, file);
    }
  }
}

// components astro.config.ts injects into every MDX file; only pages using the tag depend on them
for (const m of read('astro/astro.config.ts').matchAll(/["']import\s+(?:\{\s*(\w+)\s*\}|(\w+))\s+from\s+'([^']+)'/g)) {
  const target = resolveSpecifier(m[3], 'astro/astro.config.ts');
  if (!target) continue;
  const tag = new RegExp(`<${m[1] || m[2]}[\\s/>]`);
  for (const mdx of mdxFiles) if (tag.test(read(mdx))) addEdge(target, mdx);
}

// ── Pages ─────────────────────────────────────────────────────────────────────

const collectionOf = (f) => COLLECTIONS.find(c => f.startsWith(`${SRC}/content/${c}/`));

function isPage(f) {
  if (f.split('/').some(p => p.startsWith('_'))) return false;
  if (collectionOf(f)) return f.endsWith('.mdx');
  if (f.startsWith(`${SRC}/pages/`)) return /\.(astro|mdx?)$/.test(f) && !f.includes('[');
  return false;
}

const collectionPages = new Map(COLLECTIONS.map(c => [c, sourceFiles.filter(f => collectionOf(f) === c && isPage(f))]));

// a dynamic route stands for every page of the collection it loads
function routeCollections(f) {
  if (!f.startsWith(`${SRC}/pages/`) || !f.includes('[')) return [];
  return COLLECTIONS.filter(c => new RegExp(`getCollection\\(\\s*['"]${c}['"]`).test(read(f)));
}

// ── Walk from changed files to pages ──────────────────────────────────────────

/** @type {Map<string, 'edited'|'shared'>} page -> kind */
const affected = new Map();
const mark = (page, kind) => { if (affected.get(page) !== 'edited') affected.set(page, kind); };

function walkFrom(start, kind) {
  const seen = new Set();
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    if (seen.has(cur)) continue;
    seen.add(cur);
    if (isPage(cur)) mark(cur, kind);
    for (const c of routeCollections(cur)) for (const page of collectionPages.get(c)) mark(page, 'shared');
    for (const dep of dependents.get(cur) || []) queue.push(dep);
  }
}

// <ExtractedCode src="project/path"> shows a whole file; "project/name.snippet.id.ext" shows a snippet from it
function filesShowingExtractedCode(changed) {
  const rel = changed.slice('astro/extractedcode/'.length);
  const project = rel.split('/')[0];
  const ext = posix.extname(rel);
  const name = posix.basename(rel, ext);
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ref = new RegExp(`src="(${escape(rel)}|${escape(project)}/${escape(name)}\\.snippet\\.[^"]+${escape(ext)})"`);
  return sourceFiles.filter(f => ref.test(read(f)));
}

for (const f of changedFiles) {
  if (f.startsWith('astro/extractedcode/')) {
    for (const user of filesShowingExtractedCode(f)) walkFrom(user, 'shared');
  } else if (f.startsWith(`${SRC}/`)) {
    // a page or a content fragment changing is an edit to the pages that include it
    const contentChange = collectionOf(f) || (f.startsWith(`${SRC}/pages/`) && !f.includes('['));
    walkFrom(f, contentChange ? 'edited' : 'shared');
  }
}

// ── Titles and URLs ───────────────────────────────────────────────────────────

const frontmatter = (f) => /^---[\r\n]([\s\S]*?)[\r\n]---/.exec(read(f))?.[1] ?? '';

function getTitle(f) {
  const m = /^title:\s*["']?(.+?)["']?\s*$/m.exec(frontmatter(f))
    || (f.endsWith('.astro') && /\btitle=["']([^"'{}]+)["']/.exec(read(f)));
  if (m) return m[1].trim();
  return posix.basename(f).replace(/\.[^.]+$/, '').replace(/-/g, ' ');
}

const isDeployed = (f) => !/^route:\s*false\s*$/m.test(frontmatter(f));

function getUrl(f) {
  const collection = collectionOf(f);
  const [prefix, rest] = collection
    ? [`/${collection}`, f.slice(`${SRC}/content/${collection}/`.length)]
    : ['', f.slice(`${SRC}/pages/`.length)];
  let p = rest.replace(/\.(astro|mdx?)$/, '');
  if (p === 'index') p = '';
  else if (p.endsWith('/index')) p = p.slice(0, -'/index'.length);
  return (p ? `${prefix}/${p}` : prefix) || '/';
}

// ── Output ────────────────────────────────────────────────────────────────────

const rows = [...affected]
  .filter(([page]) => isDeployed(page))
  .map(([page, kind]) => ({ url: getUrl(page), title: getTitle(page), kind }))
  .sort((a, b) => (a.kind === b.kind ? a.url.localeCompare(b.url) : a.kind === 'edited' ? -1 : 1));

for (const { url, title, kind } of rows) process.stdout.write(`${url}\t${title}\t${kind}\n`);
