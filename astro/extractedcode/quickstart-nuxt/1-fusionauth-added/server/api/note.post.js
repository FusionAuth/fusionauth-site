import { writeFileSync } from 'node:fs';

const TARGET_FILE = 'note.txt';

export default defineEventHandler(async (event) => {
  const { content } = await readBody(event);
  writeFileSync(TARGET_FILE, content);
  return sendRedirect(event, '/'); // Refresh the page to show updated content
});
