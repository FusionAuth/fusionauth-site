// Copy the API Explorer's browser-bundle dependencies from node_modules into
// public/vendor/ so api-explorer.astro can serve them locally instead of
// loading them from jsdelivr at runtime.
//
// Runs from npm pre-hooks (predev, prebuild). Skip with SKIP_VENDOR=1 when
// iterating offline without a fresh install.

import { mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'vendor');

const FILES = [
  {
    src: join(ROOT, 'node_modules', '@scalar', 'api-reference', 'dist', 'browser', 'standalone.js'),
    dest: join(OUT_DIR, 'scalar-api-reference.js'),
  },
  {
    src: join(ROOT, 'node_modules', 'js-yaml', 'dist', 'js-yaml.min.js'),
    dest: join(OUT_DIR, 'js-yaml.min.js'),
  },
];

async function main() {
  if (process.env.SKIP_VENDOR === '1') {
    console.log('[vendor-explorer-libs] SKIP_VENDOR=1, skipping');
    return;
  }

  await mkdir(OUT_DIR, { recursive: true });

  for (const { src, dest } of FILES) {
    await copyFile(src, dest);
    console.log(`[vendor-explorer-libs] copied ${src} -> ${dest}`);
  }
}

main().catch((err) => {
  console.error('[vendor-explorer-libs] failed:', err.message);
  process.exit(1);
});
