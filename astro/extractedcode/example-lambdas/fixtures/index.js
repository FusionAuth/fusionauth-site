import { readFileSync } from 'node:fs';

// a fresh copy of fixtures/<name>.json; overrides replace top-level fields of object fixtures
export function fixture(name, overrides = {}) {
  const data = JSON.parse(readFileSync(new URL(`./${name}.json`, import.meta.url), 'utf8'));
  return Array.isArray(data) ? data : { ...data, ...overrides };
}
