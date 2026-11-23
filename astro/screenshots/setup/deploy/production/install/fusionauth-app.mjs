import { maintenanceDatabasePassword, maintenanceUrl } from '../../../kit.mjs';
import { waitForMaintenanceDatabaseToStart } from '../../../_shared.mjs';

export const screenshotIds = ['docs_deploy_production_install_1', 'docs_deploy_production_install_2'];

export async function beforeScreenshot(page, ctx) {
  if (!screenshotIds.includes(ctx?.name)) return false;

  await waitForMaintenanceDatabaseToStart();
  await page.goto(`${maintenanceUrl}/`, { waitUntil: 'networkidle' });
  await page.locator('#database_host').waitFor({ state: 'visible', timeout: 30000 });

  if (ctx.name === screenshotIds[0]) {
    await page.fill('#database_password', maintenanceDatabasePassword);
    return true;
  }

  await page.locator('#database_dbType-postgresql').check();
  await page.fill('#database_host', 'db-maintenance');
  await page.fill('#database_port', '5432');
  await page.fill('#database_database', 'fusionauth');
  await page.fill('#rootUsername', 'postgres');
  await page.fill('#rootPassword', 'hacking_is_not_cool');
  await page.fill('#database_username', 'fusionauth');
  await page.fill('#database_password', maintenanceDatabasePassword);
  await page.locator('form[action="/maintenance-mode-database-configuration"] button[type="submit"]').click();
  await page.waitForURL(url => url.pathname === '/maintenance-mode-search-configuration', { timeout: 60000 });
  await page.locator('form[action="/maintenance-mode-search-configuration"]').waitFor({ state: 'visible' });
  return true;
}

export async function afterScreenshot(page, ctx) {
  if (!screenshotIds.includes(ctx?.name) || !ctx.url) return false;
  await page.goto(ctx.url, { waitUntil: 'domcontentloaded' });
  return true;
}
