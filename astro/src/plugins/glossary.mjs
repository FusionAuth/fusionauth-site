import { slug } from 'github-slugger';
import glossary from '../data/glossary.json' with { type: 'json' };

export const GLOSSARY_PATH = '/docs/concepts/glossary';

const FIELDS = new Set(['definition', 'link', 'abbreviations', 'aliases', 'standards']);

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
