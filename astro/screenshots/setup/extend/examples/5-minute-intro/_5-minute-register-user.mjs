import { normalizeUserMethods } from '../../../_shared.mjs';
import { preparation } from '../../../kit.mjs';
import { exampleApp } from './_shared.mjs';

async function searchDinesh(page, ctx, { tag }) {
  await page.fill('#s_queryString', 'dinesh');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => [...document.querySelectorAll('main tbody tr')].length === 1, null, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  // the Manage link sits in the row's actions menu, so mark the row
  await tag('manage-user', () => document.querySelector('main a[href^="manage/00000000-0000-0000-0000-100000000004"]')?.closest('tr'));
}

async function addRegistration(page) {
  const add = await page.locator('a[href^="/admin/user/registration/add/"]').first().getAttribute('href');
  await page.goto(new URL(add, page.url()).href, { waitUntil: 'networkidle' });
  await page.locator('select').first().selectOption({ label: 'Example app' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.activeElement?.blur());
}

export const shots = {
  'five-minute-user-search': { legacyVersion: true, prepare: preparation({ beforeUserTabs: searchDinesh }), temporaryResources: [exampleApp] },
  'five-minute-registration-add': {
    legacyVersion: true,
    skipUserWait: true,
    prepare: preparation({ normalizeUser: normalizeUserMethods, beforeUserTabs: addRegistration }),
    temporaryResources: [exampleApp],
  },
};
