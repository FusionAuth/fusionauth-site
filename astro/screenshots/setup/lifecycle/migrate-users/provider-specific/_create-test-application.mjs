import { selectTab } from '../../../kit.mjs';
import { migration, windowShot, scrollToTop, showLoginUrl } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = {
  'migration-application-add': windowShot({
    before: async page => {
      await page.fill('#application_name', 'Import test application');
      await page.locator('#tenantId').selectOption(migration.importTenantId);
      await selectTab(page, 'OAuth');
      await page.getByLabel('Client secret', { exact: true }).evaluate(el => { el.value = 'import-test-secret-not-for-production'; });
      await page.locator('#redirectURLs-display input').fill('https://example.com');
      await page.locator('#redirectURLs-display input').press('Enter');
      await page.evaluate(() => document.getElementById('redirectURLs-form-row').dataset.hl = 'migration-redirect');
      await scrollToTop(page);
    },
    temporaryResources: [importTenant],
  }),
  'migration-application-login-url': windowShot({ before: page => showLoginUrl(page, migration.importAppId), temporaryResources: [importTenant] }),
};
