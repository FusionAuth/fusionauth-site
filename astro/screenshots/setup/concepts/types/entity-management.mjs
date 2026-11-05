import { preparation } from '../../kit.mjs';

async function openAddPermission(page) {
  await page.locator('header a').filter({ hasText: /Add/ }).first().click();
  await page.locator('.prime-dialog.open').waitFor();
}

async function searchEntities(page) {
  await page.locator('main button').filter({ hasText: /Search/ }).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

export const shots = {
  'entity-type-homepage': {},
  'entity-type-add': {},
  'manage-permissions': { prepare: preparation({ afterUserTabs: openAddPermission }) },
  'entity-type-add-jwt-tab': { switch: ['entityType_jwtConfiguration_enabled'] },
  'entity-homepage': { prepare: preparation({ afterUserTabs: searchEntities }) },
  'entity-add': {},
  'entity-type-scim-add': {},
};
