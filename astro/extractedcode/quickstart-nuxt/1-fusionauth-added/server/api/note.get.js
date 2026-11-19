import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const TARGET_FILE = 'note.txt';

export default defineEventHandler(() => {
  // Ensure the file exists so we don't crash
  if (!existsSync(TARGET_FILE)) writeFileSync(TARGET_FILE, 'Hello! Edit this text.');
  return { content: readFileSync(TARGET_FILE, 'utf8') };
});
