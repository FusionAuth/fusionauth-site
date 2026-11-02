#!/usr/bin/env node
/**
 * Outputs "url<TAB>title<TAB>kind<TAB>pct" lines for every deployed page affected by the current PR.
 *
 * Builds a dependency graph of astro/src (imports, `layout:` frontmatter, and the components
 * astro.config.ts auto-imports into MDX) and walks it backward from each changed file to the
 * pages that render it. A dynamic route that calls getCollection('docs'|'articles'|'blog')
 * expands to every page in that collection. A changed file under astro/extractedcode maps to
 * the pages whose <ExtractedCode> renders it.
 *
 * kind is "edited" when the page's own content changed: the page file, a content fragment it
 * includes, or a JSON example it shows. It's "shared" when the change reached the page through a
 * component, layout, route, or code sample. Edited pages come first.
 *
 * pct is the share of an edited page's content that changed, or "<1" for any change under 1%.
 * Shared pages get no pct, since a component's diff says nothing about how much the page changed.
 *
 * Environment variables:
 *   BASE_REF  - git ref to diff from, normally the PR's base branch (default: origin/main)
 *   HEAD_REF  - git ref to diff to   (default: HEAD)
 */
import { execSync } from 'child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'fs';
import { join, dirname, posix } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
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
/** @type {Map<string, Set<string>>} edited page -> changed content files it includes, for its change percentage */
const editedBy = new Map();
const mark = (page, kind, changed) => {
  if (affected.get(page) !== 'edited') affected.set(page, kind);
  if (kind !== 'edited') return;
  if (!editedBy.has(page)) editedBy.set(page, new Set());
  editedBy.get(page).add(changed);
};

// a page or a content fragment; anything else (components, layouts, routes) renders content rather than being it
const isContent = (f) => !!collectionOf(f) || (f.startsWith(`${SRC}/pages/`) && !f.includes('['));

// a change stays an edit only while it travels through content files; past a component it's shared
function walkFrom(start, startKind, changed) {
  const seen = new Map();
  const queue = [[start, startKind]];
  while (queue.length) {
    const [cur, kind] = queue.shift();
    if (seen.get(cur) === 'edited' || seen.get(cur) === kind) continue;
    seen.set(cur, kind);
    if (isPage(cur)) mark(cur, kind, changed);
    for (const c of routeCollections(cur)) {
      for (const page of collectionPages.get(c)) mark(page, 'shared', changed);
    }
    for (const dep of dependents.get(cur) || []) {
      queue.push([dep, kind === 'edited' && isContent(dep) ? 'edited' : 'shared']);
    }
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

// <JSON src="dir/file.json"> reads from astro/src/content/json; only literal paths can be matched
function filesShowingJson(changed) {
  const rel = changed.slice(`${SRC}/content/json/`.length);
  const ref = new RegExp(`<JSON\\b[^>]*\\bsrc=["']${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`);
  return sourceFiles.filter(f => ref.test(read(f)));
}

// <ExtractedCode sourceRoot="public/docs" src="file"> shows a file served from astro/public
function filesShowingPublicFile(changed) {
  const rel = changed.slice('astro/'.length);
  return sourceFiles.filter(f => [...read(f).matchAll(/<ExtractedCode\b[^>]*>/g)].some(([tag]) => {
    const root = /\bsourceRoot=["']([^"']+)["']/.exec(tag)?.[1];
    const src = /\bsrc=["']([^"']+)["']/.exec(tag)?.[1];
    return root && src && posix.join(root, src) === rel;
  }));
}

for (const f of changedFiles) {
  if (f.startsWith('astro/extractedcode/')) {
    for (const user of filesShowingExtractedCode(f)) walkFrom(user, 'shared', f);
  } else if (f.startsWith('astro/public/')) {
    for (const user of filesShowingPublicFile(f)) walkFrom(user, 'shared', f);
  } else if (f.startsWith(`${SRC}/content/json/`)) {
    // an example a page shows is part of that page's content
    for (const user of filesShowingJson(f)) walkFrom(user, isContent(user) ? 'edited' : 'shared', f);
  } else if (f.startsWith(`${SRC}/`)) {
    // a page or a content fragment changing is an edit to the pages that include it
    walkFrom(f, isContent(f) ? 'edited' : 'shared', f);
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

// ── Change statistics ─────────────────────────────────────────────────────────

// -z keeps a renamed file's new path whole; without it git prints "dir/{old => new}.mdx", which matches nothing
const numstat = new Map();
{
  const fields = execSync(
    `git -C "${REPO_ROOT}" diff --numstat -z "${BASE_REF}...${HEAD_REF}"`,
    { encoding: 'utf-8' },
  ).split('\0');
  for (let i = 0; i < fields.length - 1; i++) {
    const [a, d, file] = fields[i].split('\t');
    // a rename leaves the path empty and puts the old and new paths in the next two fields
    const path = file || fields[(i += 2)];
    if (a !== '-') numstat.set(path, { added: +a, removed: +d });   // '-' is a binary file
  }
}

const lineCount = (f) => {
  const text = read(f);
  return text ? text.split('\n').length : 0;
};

// share of the page's own content that changed: the page file plus the changed fragments it includes
function getChangePercent(page) {
  let changed = 0;
  let total = 0;
  for (const f of new Set([page, ...(editedBy.get(page) || [])])) {
    const { added = 0, removed = 0 } = numstat.get(f) || {};
    const now = lineCount(f);
    changed += added + removed;
    total += Math.max(now, now - added + removed);   // larger of the old and new length, so a rewrite caps at 100
  }
  const pct = total ? (changed / total) * 100 : 100;
  return pct > 0 && pct < 1 ? '<1' : String(Math.min(100, Math.round(pct)));
}

// ── Output ────────────────────────────────────────────────────────────────────

const rows = [...affected]
  .filter(([page]) => isFile(page) && isDeployed(page))   // a deleted page has nothing to preview
  .map(([page, kind]) => ({ url: getUrl(page), title: getTitle(page), kind, pct: kind === 'edited' ? getChangePercent(page) : '' }))
  .sort((a, b) => (a.kind === b.kind ? a.url.localeCompare(b.url) : a.kind === 'edited' ? -1 : 1));

for (const { url, title, kind, pct } of rows) process.stdout.write(`${url}\t${title}\t${kind}\t${pct}\n`);
