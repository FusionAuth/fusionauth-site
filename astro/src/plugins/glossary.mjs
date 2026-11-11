import { slug } from 'github-slugger';
import glossary from '../data/glossary.json' with { type: 'json' };

export const GLOSSARY_PATH = '/docs/concepts/glossary';

const FIELDS = new Set(['definition', 'link', 'abbreviations', 'aliases', 'standards', 'plan']);

const VALID_PLANS = new Set([
  'Community',
  'Licensed Community',
  'Starter',
  'Essentials',
  'Enterprise',
]);

function validate(id, entry) {
  const fail = (msg) => { throw new Error(`[glossary] "${id}" in src/data/glossary.json: ${msg}`); };
  for (const key of Object.keys(entry)) if (!FIELDS.has(key)) fail(`unknown field "${key}"`);
  if (typeof entry.definition !== 'string' || !entry.definition.trim()) fail('"definition" is required');
  if (typeof entry.link !== 'string' || !/^(\/docs\/|https:\/\/)/.test(entry.link)) fail('"link" must start with /docs/ or https://');
  for (const key of ['abbreviations', 'aliases']) {
    if (entry[key] !== undefined && !(Array.isArray(entry[key]) && entry[key].every(s => typeof s === 'string'))) fail(`"${key}" must be an array of strings`);
  }
  if (entry.standards !== undefined && !(Array.isArray(entry.standards) && entry.standards.every(s => s?.name && s?.url))) {
    fail('"standards" must be an array of { name, url }');
  }
  if (entry.plan !== undefined && !VALID_PLANS.has(entry.plan)) {
    fail(`"plan" must be one of: ${[...VALID_PLANS].join(', ')}`);
  }
}

// lowercased name, alias, or abbreviation -> canonical id
const lookup = new Map();
for (const [id, entry] of Object.entries(glossary)) {
  validate(id, entry);
  for (const name of [id, ...(entry.aliases ?? []), ...(entry.abbreviations ?? [])]) {
    const key = name.toLowerCase();
    const existing = lookup.get(key);
    if (existing && existing !== id) {
      throw new Error(`[glossary] "${name}" names both "${existing}" and "${id}" in src/data/glossary.json`);
    }
    lookup.set(key, id);
  }
}

const sortKey = (id) => id.replace(/[^a-z0-9]/gi, '').toLowerCase();

/** all entries as { id, anchor, ...entry }, sorted alphabetically, ignoring punctuation */
export const glossaryEntries = Object.entries(glossary)
  .map(([id, entry]) => ({ id, anchor: slug(id), ...entry }))
  .sort((a, b) => sortKey(a.id).localeCompare(sortKey(b.id)));

const byId = new Map(glossaryEntries.map(e => [e.id, e]));

/** the entry for a term name, alias, or abbreviation (case-insensitive), or undefined */
export function findGlossaryEntry(name) {
  return byId.get(lookup.get(name.trim().toLowerCase()));
}

export const glossaryAnchorHref = (entry) => `${GLOSSARY_PATH}#${entry.anchor}`;

// optimal string alignment distance: a swap of adjacent letters counts as one edit
function editDistance(a, b) {
  let prev2 = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
    }
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

/** up to 3 canonical ids that look like a misspelling of, or contain, `name` */
export function suggestGlossaryTerms(name) {
  const needle = name.trim().toLowerCase();
  const best = new Map();
  for (const [key, id] of lookup) {
    const contains = Math.min(key.length, needle.length) >= 4 && (key.includes(needle) || needle.includes(key));
    const score = contains ? 1 : editDistance(needle, key);
    if (score <= Math.max(2, Math.floor(needle.length / 4)) && score < (best.get(id) ?? Infinity)) best.set(id, score);
  }
  return [...best].sort((a, b) => a[1] - b[1]).slice(0, 3).map(([id]) => id);
}
