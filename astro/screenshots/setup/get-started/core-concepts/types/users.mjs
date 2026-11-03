import { preparation } from '../../../kit.mjs';
import { normalizeUserMethods } from '../../../_shared.mjs';

async function freezeUserMenu(page) {
  await page.locator('header el-dropdown button').click();
  await page.locator('el-menu:has(#add-user-comment)').waitFor();
  await page.evaluate(() => {
    const menu = document.querySelector('el-menu:has(#add-user-comment)');
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
  });
}

// login IPs vary between runs
async function pinLoginIps(page, ctx, info) {
  await page.locator('#recent-logins td').first().waitFor();
  await page.evaluate(() => {
    for (const cell of document.querySelectorAll('#recent-logins td')) {
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(cell.textContent.trim())) cell.textContent = '127.0.0.1';
    }
  });
  await normalizeUserMethods(page, ctx, info);
}

async function searchJian(page) {
  await page.fill('#user-search-form input[type=search], #user-search-form input[type=text]', 'jian');
  await page.locator('#user-search-form button').filter({ hasText: /Search/ }).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

const userTab = { prepare: preparation({ normalizeUser: normalizeUserMethods }) };

export const shots = {
  'user-list': {},
  'user-dropdown': { prepare: preparation({ normalizeUser: normalizeUserMethods, afterDates: freezeUserMenu }) },
  'user-locked': {},
  'user-registrations': { ...userTab },
  'user-mfa': { ...userTab },
  'user-passkeys': { ...userTab },
  'user-families': { ...userTab },
  'user-identity-providers': { ...userTab },
  'user-groups': { ...userTab },
  'user-entity-grants': { ...userTab },
  'user-recent-logins': { prepare: preparation({ normalizeUser: pinLoginIps }), shortTime: true },
  'user-consents': { ...userTab },
  'user-session': { ...userTab, shortTime: true },
  'user-current-actions': { ...userTab },
  'user-history': { ...userTab },
  'user-data': { ...userTab },
  'user-source': { ...userTab },
  'user-search-database': { prepare: preparation({ afterUserTabs: searchJian }) },
};
