import fs from 'fs';
import path from 'path';

/**
 * Resolves a source path to an absolute file path.
 * Paths containing ".snippet." are resolved from src/generated-code-snippets/
 * All other paths are resolved from localcode/
 */
export function resolveLocalPath(src: string): string {
  return src.includes('.snippet.')
    ? path.join(process.cwd(), 'src', 'generated-code-snippets', src)
    : path.join(process.cwd(), 'localcode', src);
}

export function readLocalFile(src: string): string {
  const filePath = resolveLocalPath(src);
  try { return fs.readFileSync(filePath, 'utf-8').trim(); }
  catch (err) { throw new Error(`Failed to read local file at [${filePath}]: ${(err as Error).message}`);}
}
