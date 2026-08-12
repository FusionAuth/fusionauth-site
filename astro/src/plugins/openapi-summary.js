const KEY = '__openapiMissing';

export function recordMissing(method, path, page) {
  if (!globalThis[KEY]) globalThis[KEY] = new Map();
  const endpoint = `${method.toUpperCase()} ${path}`;
  if (!globalThis[KEY].has(endpoint)) globalThis[KEY].set(endpoint, new Set());
  globalThis[KEY].get(endpoint).add(page);
}

export function openapiSummary() {
  return {
    name: 'openapi-summary',
    hooks: {
      'astro:build:done': () => {
        const map = globalThis[KEY];
        if (!map || map.size === 0) return;
        const verbose = process.env.VERBOSE === 'true';
        console.warn(`[openapi] ${map.size} endpoint(s) not in spec`);
        if (verbose) {
          for (const [endpoint, pages] of [...map.entries()].sort()) {
            console.warn(`  ${endpoint}`);
            for (const page of [...pages].sort()) {
              console.warn(`    ${page}`);
            }
          }
        }
      },
    },
  };
}
