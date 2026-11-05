import { migration, windowShot, searchUsers } from './_shared.mjs';

const exampleUsers = {
  order: 16,
  paths: migration.exampleUsers.map(([id]) => `/api/user/${id}?hardDelete=true`),
  create: async api => {
    for (const [id, email, firstName, lastName] of migration.exampleUsers) {
      await api(`/api/user/${id}`, 'POST', { user: { email, firstName, lastName, password: 'password' }, skipVerification: true });
    }
  },
};

export const shots = {
  'migration-example-users': windowShot({ before: (page, tag) => searchUsers(page, tag, migration.exampleUsers), temporaryResources: [exampleUsers] }),
  'migration-example-app-redirect': windowShot({
    fixedHeight: "[data-hl='migration-scroll']",
    before: async page => {
      await page.locator('#redirectURLs-display input').fill('http://localhost:7771/callback');
      await page.locator('#redirectURLs-display input').press('Enter');
      await page.evaluate(() => document.getElementById('redirectURLs-form-row').dataset.hl = 'migration-redirect');
      await page.evaluate(() => document.getElementById('application_oauthConfiguration_clientId-form-row').dataset.hl = 'migration-scroll');
    },
  }),
};
