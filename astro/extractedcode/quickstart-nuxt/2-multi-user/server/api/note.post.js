import { writeFileSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  const { user } = (await getUserSession(event)).data;
  const { content } = await readBody(event);
  writeFileSync(getUserFile(user.id), content);
  return sendRedirect(event, '/'); // Refresh the page to show updated content
});
