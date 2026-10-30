import { windowShot } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = {
  'migration-role-add': windowShot({
    before: async page => {
      await page.locator('main a[href^="/ajax/application/add-role"]').click();
      await page.locator('.prime-dialog.open #role_name').waitFor();
      await page.waitForTimeout(500);
      await page.fill('.prime-dialog.open #role_name', 'user');
      await page.evaluate(() => { const d = document.querySelector('.prime-dialog.open #role_isDefault'); if (!d.checked) d.click(); });
      await page.waitForTimeout(500);
    },
    temporaryResources: [importTenant],
  }),
};
