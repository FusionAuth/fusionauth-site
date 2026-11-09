import { normalizeRegistrationIds, temporaryResources31 as registerResources } from './register/_shared.mjs';
import { normalizeUserMethods } from '../_shared.mjs';
import { forgotPasswordTemplate } from '../migrate/index.mjs';
import { preparation, dineshId } from '../kit.mjs';

// pins the registration ids and puts the page back at the top
const settle = async (page, ctx, info) => {
  await normalizeRegistrationIds(page, info);
  await page.evaluate(() => window.scrollTo(0, 0));
};

async function openUserMenu(page, text) {
  await page.locator('header el-dropdown button').click();
  const target = page.locator('el-menu a, el-menu button').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`, 'i') }).first();
  await target.waitFor({ state: 'visible' });
  return target;
}

// highlights the item in a copy of the open menu, which stays put for the screenshot
const showMenuItem = text => async (page, ctx, info) => {
  const target = await openUserMenu(page, text);
  await target.evaluate(el => el.dataset.hl = 'register-menu-target');
  await page.evaluate(() => {
    const menu = document.querySelector('el-menu:has([data-hl="register-menu-target"])');
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
    menu.querySelector('[data-hl]').removeAttribute('data-hl');
  });
  await settle(page, ctx, info);
};

const openMenuDialog = (text, comment) => async (page, ctx, info) => {
  const target = await openUserMenu(page, text);
  await target.click();
  await page.locator('.prime-dialog.open').waitFor();
  if (comment) await page.locator('.prime-dialog.open textarea').fill(comment);
  await settle(page, ctx, info);
};

async function searchDinesh(page, ctx, info) {
  await page.fill('#s_queryString', 'dinesh');
  await page.locator('#user-search-form button').filter({ hasText: /Search/ }).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await settle(page, ctx, info);
}

async function fillNewUser(page, ctx, info) {
  await page.locator('label[for=sendSetPasswordIdentityType-doNotSend]').click();
  await page.fill('#user_username', 'carla');
  await page.fill('#user_email', 'carla@piedpiper.com');
  await page.fill('#user_password', 'password');
  await page.fill('#confirm_user_password', 'password');
  await normalizeRegistrationIds(page, info);
  // show the password fields without waiting for their slide-open animation
  await page.waitForTimeout(300);
  await page.evaluate(id => {
    for (let panel = document.getElementById(id); panel && panel.tagName !== 'FORM'; panel = panel.parentElement) {
      if (!panel.classList.contains('slide-open')) continue;
      panel.classList.remove('hidden');
      panel.classList.add('open');
      panel.style.removeProperty('display');
      panel.style.setProperty('height', 'auto', 'important');
      panel.style.setProperty('max-height', 'none', 'important');
    }
  }, 'user_password');
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function selectApplication(page, ctx, info) {
  await page.locator('select').first().waitFor();
  await settle(page, ctx, info);
}

async function selectSupportRole(page, ctx, info) {
  await page.locator('select').first().waitFor();
  await page.locator('select').first().selectOption({ label: 'FusionAuth' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const role = page.locator('input[value=user_support_manager]');
  await role.check();
  await role.evaluate(el => (el.closest('.checkbox') ?? el.parentElement.parentElement).dataset.hl = 'register-support-role');
  await settle(page, ctx, info);
}

// Normalize action dates before the table performs its initial layout.
async function pinActionDates(page) {
  await page.route(`**/admin/user/manage/${dineshId}*`, async route => {
    const response = await route.fetch();
    const body = (await response.text()).replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '24/09/2026').replace(/\b\d{2}:\d{2}(:\d{2}(,\d{3})?)? (AM|PM)\b/g, '09:00 AM');
    await route.fulfill({ response, body });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

async function openActionMenu(page, ctx, info) {
  await page.locator('#current-actions el-dropdown button').first().click();
  await page.locator('#current-actions a[href^="/ajax/user/cancel-action/"]').first().waitFor({ state: 'visible' });
  await settle(page, ctx, info);
}

async function freezeActionMenu(page) {
  await page.evaluate(() => {
    const menu = document.querySelector('#current-actions [popover]');
    menu.showPopover();
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
  });
}

async function confirmActionCancellation(page, ctx, info) {
  await page.locator('main img').evaluateAll(async images => {
    await Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode().catch(() => {}); }));
  });
  await page.locator('#current-actions a[href^="/ajax/user/cancel-action/"]').first().evaluate(el => { el.closest('[popover]')?.showPopover(); el.click(); });
  await page.locator('.prime-dialog.open').waitFor();
  await settle(page, ctx, info);
}

const register = (beforeSizing, stages) => ({ fixedHeight: null, prepare: preparation({ ...stages, beforeSizing }), temporaryResources: [registerResources] });
// the user manage page also shows ids FusionAuth generates on each start
const managed = (beforeSizing, stages) => register(beforeSizing, { normalizeUser: normalizeUserMethods, ...stages });

export const shots = {
  'register-users-tab': register(searchDinesh),
  'register-new-user-form': register(fillNewUser),
  // the menu only offers a password reset once the tenant has a forgot password template
  'register-send-password-reset': { ...managed(showMenuItem('Send password reset')), temporaryState: [forgotPasswordTemplate] },
  'register-confirm-reset': { ...managed(openMenuDialog('Send password reset')), temporaryState: [forgotPasswordTemplate] },
  'register-require-password-change': managed(showMenuItem('Require password change')),
  'register-confirm-change': managed(openMenuDialog('Require password change')),
  'register-verify': managed(settle),
  'register-edit-user': register(settle),
  'register-sessions': managed(settle),
  'register-lock-account': managed(showMenuItem('Lock account')),
  'register-confirm-lock': managed(openMenuDialog('Lock account')),
  'register-unlock-account': register(showMenuItem('Unlock account')),
  'register-confirm-unlock': register(openMenuDialog('Unlock account')),
  'register-add-registration': managed(settle),
  'register-select-application': register(selectApplication),
  'register-roles': register(selectSupportRole),
  'register-add-comment': managed(showMenuItem('Add a comment')),
  'register-write-comment': managed(openMenuDialog('Add a comment', 'Customer requested help updating their profile.')),
  'register-remove-user-action': managed(openActionMenu, { prepare: pinActionDates, finish: freezeActionMenu }),
  'register-confirm-action-cancellation': managed(confirmActionCancellation),
};
