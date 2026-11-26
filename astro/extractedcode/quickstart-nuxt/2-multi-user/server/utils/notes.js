import { mkdirSync } from 'node:fs';

// set up a directory for multi-user files
const DATA_DIR = 'user_data';
mkdirSync(DATA_DIR, { recursive: true });

// helper to get specific user file
export function getUserFile(userId) {
  return `${DATA_DIR}/note-${userId}.txt`;
}
