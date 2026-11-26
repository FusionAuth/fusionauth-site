import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export default defineEventHandler(async (event) => {
  const { user } = (await getUserSession(event)).data;
  const targetFile = getUserFile(user.id);

  // Ensure the file exists so we don't crash
  if (!existsSync(targetFile)) writeFileSync(targetFile, `Hello ${user.name}!`);
  return { name: user.name, content: readFileSync(targetFile, 'utf8') };
});
