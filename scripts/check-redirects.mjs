#!/usr/bin/env node
/**
 * Reports the redirects.json changes needed by a git diff that renames,
 * moves, or deletes content pages.
 *
 * Content pages live in astro/src/content/{docs,articles,blog} and map to URLs
 * by stripping the extension (foo/index.mdx -> /docs/foo). Moving one leaves the
 * old URL 404ing unless `redirects` gains an entry, and a folder index page only
 * resolves with a trailing slash if `indexPaths` has one. Underscore-prefixed
 * fragments and `route: false` pages never get a URL, so they are ignored.
 *
 * Reports:
 *   - `redirects` entries to add, for URLs that moved or went away
 *   - existing `redirects` entries whose target moved, with the new value
 *   - `indexPaths` entries to add, for any routable folder index page that lacks one
 *   - `indexPaths` entries that point at a folder with no index page
 *   - removed pages it could not find a new home for, to fill in by hand
 *   - existing `redirects` entries whose target no page serves (deleted or never existed)
 *
 * Pairing a deletion with its new location relies on git's rename detection,
 * which needs the move staged or committed. An unstaged move is a deletion plus
 * an untracked file, and those are paired only when the filename is unchanged;
 * a rename in place is reported as a removal needing a target. `git add` the
 * move first and the pairing is exact.
 *
 * Exits 1 when anything is needed, 0 when the diff needs no redirect work.
 *
 * Usage:
 *   scripts/check-redirects.mjs                      # working tree vs HEAD
 *   scripts/check-redirects.mjs --base origin/main    # branch vs main
 *   scripts/check-redirects.mjs --base origin/main --head HEAD
 *   scripts/check-redirects.mjs --write               # apply to redirects.json
 *
 * Environment variables:
 *   BASE_REF — same as --base
 *   HEAD_REF — same as --head
 */
import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, posix } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REDIRECTS_FILE = 'redirects.json';

// ── Arguments ─────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flag = (...names) => {
  const i = argv.findIndex(a => names.includes(a));
  return i === -1 ? null : argv[i + 1];
};
const has = (...names) => argv.some(a => names.includes(a));

if (has('--help', '-h')) {
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf-8');
  const header = source.slice(source.indexOf('/**') + 3, source.indexOf('*/'));
  process.stdout.write(header.split('\n').map(l => l.replace(/^\s*\* ?/, '')).join('\n').trim() + '\n');
  process.exit(0);
}

const BASE_REF = flag('--base', '-b') || process.env.BASE_REF || null;
const HEAD_REF = flag('--head') || process.env.HEAD_REF || null;
const WRITE = has('--write');

// Working-tree mode: no base given, so diff HEAD against what is on disk.
const workingTree = !BASE_REF && !HEAD_REF;

const git = (...args) => execFileSync('git', ['-C', REPO_ROOT, ...args], {
  encoding: 'utf-8',
  maxBuffer: 64 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'], // capture stderr; a missing path is expected
});

// ── URL mapping ───────────────────────────────────────────────────────────────

const COLLECTIONS = [
  ['astro/src/content/docs/', '/docs'],
  ['astro/src/content/articles/', '/articles'],
  ['astro/src/content/blog/', '/blog'],
];

/** Collection-relative path, or null when the file is not collection content. */
function collectionEntry(path) {
  for (const [base, prefix] of COLLECTIONS) {
    if (path.startsWith(base)) return { prefix, rel: path.slice(base.length) };
  }
  return null;
}

/**
 * Deployed URL for a content file, or null when it never gets one.
 * Mirrors the content.config.js glob (`!**\/_*.mdx`, `!**\/_*\/**\/*.mdx`) and the
 * slug handling in astro/src/pages/{docs,articles,blog}/[...slug].astro.
 */
function urlFor(path) {
  const entry = collectionEntry(path);
  if (!entry) return null;
  if (!entry.rel.endsWith('.mdx')) return null;
  if (entry.rel.split('/').some(part => part.startsWith('_'))) return null;

  const slug = entry.rel.replace(/\.mdx$/, '');
  if (slug === 'index') return entry.prefix;
  if (slug.endsWith('/index')) return `${entry.prefix}/${slug.slice(0, -'/index'.length)}`;
  return `${entry.prefix}/${slug}`;
}

/**
 * Whether some page still serves this URL after the change. Moving
 * `foo/index.mdx` to `foo.mdx` keeps the URL, so it needs no redirect.
 */
function stillServed(url) {
  for (const [base, prefix] of COLLECTIONS) {
    if (url !== prefix && !url.startsWith(`${prefix}/`)) continue;
    const rel = url === prefix ? '' : url.slice(prefix.length + 1);
    for (const candidate of [`${base}${rel || 'index'}.mdx`, `${base}${rel}/index.mdx`]) {
      if (newExists(candidate) && isRouted(readNew(candidate))) return true;
    }
  }
  return false;
}

// ── Reading either side of the diff ───────────────────────────────────────────

// Three-dot diffs compare against the merge base, so old-side reads must too.
const oldRef = workingTree
  ? 'HEAD'
  : git('merge-base', BASE_REF || 'HEAD', HEAD_REF || 'HEAD').trim();

function readOld(path) {
  try { return git('show', `${oldRef}:${path}`); } catch { return null; }
}

function readNew(path) {
  if (workingTree) {
    const abs = join(REPO_ROOT, path);
    return existsSync(abs) ? readFileSync(abs, 'utf-8') : null;
  }
  try { return git('show', `${HEAD_REF || 'HEAD'}:${path}`); } catch { return null; }
}

let headFiles = null;
function newExists(path) {
  if (workingTree) return existsSync(join(REPO_ROOT, path));
  if (!headFiles) {
    headFiles = new Set(git('ls-tree', '-r', '--name-only', HEAD_REF || 'HEAD')
      .split('\n').filter(Boolean));
  }
  return headFiles.has(path);
}

/** True when a page is built as a URL -- `route: false` keeps it out of the build. */
function isRouted(source) {
  if (source == null) return false;
  const fm = /^---[\r\n]([\s\S]*?)[\r\n]---/.exec(source);
  return !(fm && /^route:\s*false\s*$/m.test(fm[1]));
}

/**
 * Whether `indexPaths` should carry this folder. Every routable folder index
 * page deploys as `<folder>/index.html` -- src/integrations/astro-index-pages
 * guarantees that -- so the trailing-slash URL is the one that serves the file
 * and every one of them needs an entry.
 */
function needsIndexPath(indexPath) {
  return newExists(indexPath) && isRouted(readNew(indexPath));
}

// ── Changed files ─────────────────────────────────────────────────────────────

const renames = [];  // { from, to }
const added = [];
const modified = [];
const deleted = [];

const diffArgs = workingTree
  ? ['diff', '--name-status', '-M', 'HEAD']
  : ['diff', '--name-status', '-M', `${BASE_REF || 'HEAD'}...${HEAD_REF || 'HEAD'}`];

for (const line of git(...diffArgs).split('\n').filter(Boolean)) {
  const parts = line.split('\t');
  const status = parts[0][0];
  if (status === 'R' || status === 'C') renames.push({ from: parts[1], to: parts[2] });
  else if (status === 'A') added.push(parts[1]);
  else if (status === 'D') deleted.push(parts[1]);
  else if (status === 'M') modified.push(parts[1]); // may have flipped `route`
}

// An editor-driven move shows up as a delete plus an untracked file, which git
// cannot pair into a rename. Feed those in so the pairing below can.
if (workingTree) {
  for (const path of git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean)) {
    if (collectionEntry(path)) added.push(path);
  }
}

// ── Pair up moves ─────────────────────────────────────────────────────────────

const moves = [];       // { oldUrl, newUrl, from, to, inferred }
const unpairedAdds = new Set(added.filter(p => urlFor(p)));
const unresolved = [];  // { oldUrl, from, suggestion, alternatives }

for (const { from, to } of renames) {
  const oldUrl = urlFor(from);
  const newUrl = urlFor(to);
  if (oldUrl && newUrl && oldUrl !== newUrl) moves.push({ oldUrl, newUrl, from, to, inferred: false });
  else if (oldUrl && !newUrl) deleted.push(from); // page became a fragment
  if (newUrl) unpairedAdds.add(to);
}

const pendingDeletes = deleted.filter(
  p => urlFor(p) && isRouted(readOld(p)) && !stillServed(urlFor(p)));

// Same filename somewhere else in the diff is almost always the same page moved.
const remaining = [];
for (const from of pendingDeletes) {
  const name = posix.basename(from);
  const matches = [...unpairedAdds].filter(p => posix.basename(p) === name);
  if (matches.length === 1 && urlFor(from) !== urlFor(matches[0])) {
    moves.push({ oldUrl: urlFor(from), newUrl: urlFor(matches[0]), from, to: matches[0], inferred: true });
    unpairedAdds.delete(matches[0]);
  } else {
    remaining.push(from);
  }
}

// Folder-level moves, voted on by the file moves inside them, cover the rest:
// a deleted page whose folder moved most likely belongs at the new folder.
const folderVotes = new Map();
for (const { from, to } of moves) {
  const oldDir = posix.dirname(from);
  const newDir = posix.dirname(to);
  if (oldDir === newDir) continue;
  if (!folderVotes.has(oldDir)) folderVotes.set(oldDir, new Map());
  const votes = folderVotes.get(oldDir);
  votes.set(newDir, (votes.get(newDir) || 0) + 1);
}

function folderTargets(dir) {
  for (let d = dir; d && d !== '.'; d = posix.dirname(d)) {
    const votes = folderVotes.get(d);
    if (!votes) continue;
    return [...votes.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([newDir]) => newDir);
  }
  return [];
}

for (const from of remaining) {
  const oldUrl = urlFor(from);
  const candidates = [];
  for (const newDir of folderTargets(posix.dirname(from))) {
    // Prefer a same-named page in the new folder, else the folder's index page.
    const sameName = `${newDir}/${posix.basename(from)}`;
    for (const candidate of [sameName, `${newDir}/index.mdx`]) {
      if (newExists(candidate) && isRouted(readNew(candidate))) {
        candidates.push(urlFor(candidate));
        break;
      }
    }
  }
  const unique = [...new Set(candidates)];
  unresolved.push({ oldUrl, from, suggestion: unique[0] || null, alternatives: unique.slice(1) });
}

// ── Work out the redirects.json changes ───────────────────────────────────────

const redirectsPath = join(REPO_ROOT, REDIRECTS_FILE);
const rawRedirects = readFileSync(redirectsPath, 'utf-8');
const config = JSON.parse(rawRedirects);
const { redirects, indexPaths } = config;

const movedUrl = new Map(moves.map(m => [m.oldUrl, m.newUrl]));

const redirectAdds = [];    // { key, value, note }
const redirectUpdates = []; // { key, from, to, note }
const shadowed = [];        // { key, url }

// Only ever fills a gap. A key that already has a value is not a 404, and its
// target is either still live or picked up by the "target moved" pass below --
// either way a human chose it, so it is left alone.
function planRedirect(key, value, note) {
  if (redirects[key] !== undefined) return;
  redirectAdds.push({ key, value, note });
}

for (const move of moves) {
  const note = move.inferred ? 'inferred from the filename' : null;
  planRedirect(move.oldUrl, move.newUrl, note);
}

for (const item of unresolved) {
  if (!item.suggestion) continue;
  const note = item.alternatives.length
    ? `suggestion, confirm -- also plausible: ${item.alternatives.join(', ')}`
    : 'suggestion -- confirm this is the right landing page';
  planRedirect(item.oldUrl, item.suggestion, note);
}

// Existing redirects pointing at a URL that moved would land on a 404.
for (const [key, value] of Object.entries(redirects)) {
  const bare = value.endsWith('/') && value !== '/' ? value.slice(0, -1) : value;
  const target = movedUrl.get(bare);
  if (!target) continue;
  const next = value === bare ? target : `${target}/`;
  if (next === value) continue;
  redirectUpdates.push({ key, from: value, to: next, note: 'target moved' });
}

// Existing redirects pointing at a URL nothing serves (deleted, or never existed) also land on a 404.
const prefixRules = (config.redirectsByPrefix || []).map(([prefix]) => prefix);
// routes in src/pages; the collection [...slug] pages are what stillServed already checks
const pageRoutes = git('ls-files', 'astro/src/pages').split('\n')
  .filter(p => p && !/\/(docs|articles|blog)\/\[\.\.\.slug\]\.astro$/.test(p))
  .map(p => p.replace(/^astro\/src\/pages/, '').replace(/\.(astro|mdx?|js|ts)$/, '').replace(/\/index$/, '') || '/')
  .map(r => new RegExp(`^${r.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+')}$`));
const updated = new Set(redirectUpdates.map(u => u.key));
const deadTargets = [];  // { key, value }
for (const [key, value] of Object.entries(redirects)) {
  if (updated.has(key)) continue;
  const bare = value.split(/[?#]/)[0].replace(/(.)\/$/, '$1');
  if (!COLLECTIONS.some(([, prefix]) => bare === prefix || bare.startsWith(`${prefix}/`))) continue;
  if (stillServed(bare) || redirects[bare] !== undefined || redirects[`${bare}/`] !== undefined) continue;
  if (prefixRules.some(p => bare.startsWith(p)) || pageRoutes.some(r => r.test(bare))) continue;
  // generated files (llms.txt, feeds) have no source page to check
  if (/\.[a-z0-9]+$/i.test(bare)) continue;
  deadTargets.push({ key, value });
}

// The Lambda 301s /foo/ to /foo before it looks up a redirect (unless /foo/ is in indexPaths),
// so a trailing-slash key is never matched: keep only the bare form.
const slashKeys = [];  // { key, value, fix: 'drop' | 'rename' | null, why }
// mirrors removeSlash() in the site-origin-request-handler Lambda (fusionauth-site-infra)
const lambdaStripsSlash = uri => indexPaths[uri] !== true
  && (!uri.startsWith('/blog') || (/^\/blog\/[\w\d-]*\/$/.test(uri) && uri !== '/blog/latest/'))
  && !prefixRules.some(p => uri.startsWith(p));
for (const [key, value] of Object.entries(redirects)) {
  if (key === '/' || !key.endsWith('/') || !lambdaStripsSlash(key)) continue;
  const bare = key.slice(0, -1);
  const same = v => (v || '').replace(/(.)\/$/, '$1') === value.replace(/(.)\/$/, '$1');
  if (value.replace(/(.)\/$/, '$1') === bare) slashKeys.push({ key, value, fix: 'drop', why: 'the Lambda already strips the slash' });
  else if (redirects[bare] === undefined) slashKeys.push({ key, value, fix: 'rename', why: `use ${JSON.stringify(bare)}` });
  else if (same(redirects[bare])) slashKeys.push({ key, value, fix: 'drop', why: `duplicates ${JSON.stringify(bare)}` });
  else slashKeys.push({ key, value, fix: null, why: `conflicts with ${JSON.stringify(bare)} -> ${JSON.stringify(redirects[bare])}` });
}

// A redirect on a live page's own URL hides that page.
for (const move of moves) {
  if (redirects[move.newUrl] !== undefined) shadowed.push({ key: move.newUrl, url: move.newUrl });
}

// ── indexPaths ────────────────────────────────────────────────────────────────

const indexAdds = [];    // key
const indexRemovals = []; // key

// The whole tree, not only the diff, so an entry that went stale or never got added still shows up.
const newFiles = workingTree
  ? git('ls-files', '--cached', '--others', '--exclude-standard').split('\n').filter(p => p && newExists(p))
  : git('ls-tree', '-r', '--name-only', HEAD_REF || 'HEAD').split('\n').filter(Boolean);
const wantedIndexKeys = new Set(newFiles
  .filter(p => /(^|\/)index\.mdx$/.test(p) && urlFor(p) && needsIndexPath(p))
  .map(p => `${urlFor(p)}/`));

for (const key of [...wantedIndexKeys].sort()) {
  if (indexPaths[key] !== true) indexAdds.push(key);
}
// only entries inside a collection are ours; some, /blog/ among them, are served by src/pages routes
for (const key of Object.keys(indexPaths)) {
  if (wantedIndexKeys.has(key)) continue;
  const bare = key.replace(/(.)\/$/, '$1');
  if (!COLLECTIONS.some(([, prefix]) => bare === prefix || bare.startsWith(`${prefix}/`))) continue;
  if (pageRoutes.some(r => r.test(bare))) continue;
  indexRemovals.push(key);
}

// ── Report ────────────────────────────────────────────────────────────────────

const out = s => process.stdout.write(`${s}\n`);
const entryLine = (k, v) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`;

const comparison = workingTree
  ? 'working tree against HEAD'
  : `${HEAD_REF || 'HEAD'} against ${BASE_REF || 'HEAD'} (merge base ${oldRef.slice(0, 9)})`;

out(`Comparing ${comparison}`);
out(`${moves.length} page move(s), ${unresolved.length} removal(s) without an obvious new home`);

// a hand-written entry resolves a removal the script couldn't place
const stillUnresolved = unresolved.filter(u => !u.suggestion
  && redirects[u.oldUrl] === undefined);
const needed = redirectAdds.length + redirectUpdates.length + indexAdds.length
  + indexRemovals.length + stillUnresolved.length + deadTargets.length + slashKeys.length;

if (!needed && !shadowed.length) {
  out('');
  out(`${REDIRECTS_FILE} needs no changes.`);
  process.exit(0);
}

if (redirectAdds.length) {
  out('');
  out(`Add to "redirects" (${redirectAdds.length}):`);
  out('');
  for (const { key, value, note } of redirectAdds.sort((a, b) => a.key.localeCompare(b.key))) {
    out(entryLine(key, value) + (note ? `    // ${note}` : ''));
  }
}

if (redirectUpdates.length) {
  out('');
  out(`Update in "redirects" (${redirectUpdates.length}):`);
  out('');
  for (const { key, from, to, note } of redirectUpdates.sort((a, b) => a.key.localeCompare(b.key))) {
    out(`  - ${entryLine(key, from)}`);
    out(`  + ${entryLine(key, to)}` + (note ? `    // ${note}` : ''));
  }
}

if (indexAdds.length) {
  out('');
  out(`Add to "indexPaths" (${indexAdds.length}):`);
  out('');
  for (const key of indexAdds.sort()) out(entryLine(key, true));
}

if (indexRemovals.length) {
  out('');
  out(`Remove from "indexPaths" (${indexRemovals.length}) -- these folders no longer have an index page:`);
  out('');
  for (const key of indexRemovals.sort()) out(entryLine(key, true));
}

if (stillUnresolved.length) {
  out('');
  out(`No redirect target could be worked out for ${stillUnresolved.length} removed page(s).`);
  out('Pick a target for each and add it to "redirects" by hand:');
  out('');
  for (const { oldUrl, from } of stillUnresolved.sort((a, b) => a.oldUrl.localeCompare(b.oldUrl))) {
    out(`${entryLine(oldUrl, 'TODO')}    // was ${from}`);
  }
}

if (slashKeys.length) {
  out('');
  out(`List redirects by their URL without a trailing slash (${slashKeys.length}):`);
  out('');
  for (const { key, value, fix, why } of slashKeys) {
    out(`${entryLine(key, value)}    // ${fix ? `${fix}: ` : 'fix by hand: '}${why}`);
  }
}

if (deadTargets.length) {
  out('');
  out(`These ${deadTargets.length} redirect(s) point at a URL no page serves. Pick a live target for each by hand:`);
  out('');
  for (const { key, value } of deadTargets.sort((a, b) => a.key.localeCompare(b.key))) out(entryLine(key, value));
}

if (shadowed.length) {
  out('');
  out('These live pages also have a "redirects" entry on their own URL, which hides them:');
  out('');
  for (const { key } of shadowed) out(`    ${JSON.stringify(key)} -> ${JSON.stringify(redirects[key])}`);
}

// ── Apply ─────────────────────────────────────────────────────────────────────

if (WRITE) {
  // Keys go in roughly alphabetical order, so insert before the first key that
  // sorts after the new one rather than re-sorting the whole block.
  const insert = (obj, key, value) => {
    const keys = Object.keys(obj);
    const at = keys.findIndex(k => k.localeCompare(key) > 0);
    if (at === -1) { obj[key] = value; return; }
    const rebuilt = {};
    for (const k of keys.slice(0, at)) rebuilt[k] = obj[k];
    rebuilt[key] = value;
    for (const k of keys.slice(at)) rebuilt[k] = obj[k];
    for (const k of Object.keys(obj)) delete obj[k];
    Object.assign(obj, rebuilt);
  };

  for (const { key, value } of redirectAdds) insert(redirects, key, value);
  for (const { key, to } of redirectUpdates) redirects[key] = to;
  for (const key of indexAdds) insert(indexPaths, key, true);
  for (const key of indexRemovals) delete indexPaths[key];
  // rename in place so the key keeps its position in the file
  const slashFixes = new Map(slashKeys.filter(k => k.fix).map(k => [k.key, k.fix]));
  if (slashFixes.size) {
    const rebuilt = {};
    for (const [key, value] of Object.entries(redirects)) {
      const fix = slashFixes.get(key);
      if (fix === 'drop') continue;
      rebuilt[fix === 'rename' ? key.slice(0, -1) : key] = value;
    }
    for (const k of Object.keys(redirects)) delete redirects[k];
    Object.assign(redirects, rebuilt);
  }

  writeFileSync(redirectsPath, `${JSON.stringify(config, null, 2)}\n`);
  out('');
  out(`Wrote ${REDIRECTS_FILE}.`);
  const byHand = stillUnresolved.length + deadTargets.length + slashKeys.filter(k => !k.fix).length;
  if (byHand) out('The entries flagged above still need fixing by hand.');
  process.exit(byHand ? 1 : 0);
}

process.exit(1);
