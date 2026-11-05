import { migration, windowShot, migrationShot, searchUsers } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = {
  'migration-users-list': windowShot({ before: (page, tag) => searchUsers(page, tag, migration.importUsers), temporaryResources: [importTenant] }),
  'migration-user-login': migrationShot({
    signedOut: true,
    before: async page => {
      await page.fill('#loginId', migration.importUsers[0][1]);
      await page.fill('#password', 'password');
    },
    temporaryResources: [importTenant],
  }),
};
