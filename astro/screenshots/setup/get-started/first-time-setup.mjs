import { normalizeUserMethods } from '../_shared.mjs';
import { preparation, freshUrl, runtime } from '../kit.mjs';
import { exampleAppId, exampleApp } from './_example-app.mjs';

// Pin generated values in the older overview capture.
async function pinRecentLogins(page) {
  await page.evaluate(() => {
    const users = ['richard@piedpiper.com', 'jianyang@octhulu.com', 'gavin@hooli.com', 'monica@raviga.com', 'gilfoyle@piedpiper.com', 'dinesh@piedpiper.com', 'erlich@bachmanity.com', 'bighead@piedpiper.com', 'richard@piedpiper.com', 'richard@piedpiper.com'];
    document.querySelectorAll('main tbody tr').forEach((row, i) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 4 || !users[i]) return;
      cells[0].textContent = users[i];
      cells[1].textContent = i === 0 || i === 9 ? 'FusionAuth' : 'Pied Piper';
      cells[3].textContent = i === 0 ? '192.168.65.1' : '127.0.0.1';
    });
  });
}

// FusionAuth creates the Tenant manager application with a new random id on each start
async function pinTenantManagerId(page) {
  const pinned = await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
    const cell = row?.querySelectorAll('td')[1];
    if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
    return !!cell;
  });
  if (!pinned) throw new Error('Tenant manager row not found');
}

async function showClientCredentials(page, ctx, { url, tag }) {
  await page.evaluate(id => {
    const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, exampleAppId);
  await page.locator('.prime-dialog.open, dialog[open]').first().waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(origin => {
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open, dialog[open]'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(origin, 'https://local.fusionauth.io');
  }, new URL(url).origin);
  await tag('client-credentials', () => {
    const rows = [...document.querySelectorAll('.prime-dialog.open tr, dialog[open] tr, .prime-dialog.open dt, dialog[open] dt')];
    const id = rows.find(r => /^Client Id/i.test(r.textContent.trim()));
    const secret = rows.find(r => /^Client secret/i.test(r.textContent.trim()));
    if (!id || !secret) return null;
    let scroller = id.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    if (scroller) scroller.scrollTop += id.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
    // one box around both rows
    const box = document.createElement('div');
    const a = id.getBoundingClientRect(), b = secret.getBoundingClientRect();
    box.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    document.body.append(box);
    return box;
  });
}

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

// first-time setup shots run against the fresh instance, which starts at the Setup Wizard
const freshAdmin = { email: 'richard@piedpiper.com', firstName: 'Richard', lastName: 'Hendricks', password: 'password' };
// the step form generates a random key on every load
const pinnedApiKey = 'bS7xQ2mN9vK4tR8wL3pZ6yH1cF5jD0gA2eU7oI9sW4n';

async function fillSetupWizard(page) {
  await page.fill('#user_email', freshAdmin.email);
  await page.fill('#user_firstName', freshAdmin.firstName);
  await page.fill('#user_lastName', freshAdmin.lastName);
  await page.fill('#user_password', freshAdmin.password);
  await page.fill('#passwordConfirm', freshAdmin.password);
  await page.selectOption('#acquisition_channel', 'Other');
  // Other requires a note
  await page.fill('#acquisition_other', 'Documentation');
  await page.check('#acceptLicense');
  await page.evaluate(() => document.activeElement?.blur());
}

export async function showSetupWizard(page) {
  if (!new URL(page.url()).pathname.startsWith('/admin/setup-wizard')) {
    throw new Error('the fresh instance is past the Setup Wizard; run `docker compose -f screenshots/docker-compose.yml rm -sf fusionauth-fresh db-fresh` and retry');
  }
  await fillSetupWizard(page);
}

async function showSetupStep(page, ctx, { url }) {
  if (!runtime.freshSetUp) {
    await page.goto(`${freshUrl}/admin/setup-wizard`, { waitUntil: 'networkidle' });
    if (new URL(page.url()).pathname.startsWith('/admin/setup-wizard')) {
      await fillSetupWizard(page);
      await page.click('button[type=submit]');
      await page.waitForURL(u => u.pathname.startsWith('/admin') && !u.pathname.startsWith('/admin/setup-wizard'), { timeout: 30000 });
    }
    runtime.freshSetUp = true;
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  if (await page.locator('#loginId').isVisible()) {
    await page.fill('#loginId', freshAdmin.email);
    await page.fill('#password', freshAdmin.password);
    await page.press('#password', 'Enter');
    await page.waitForURL(u => u.pathname.startsWith('/admin/first-time-setup'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
  }
  if (await page.locator('#apiKey_key').isVisible()) await page.fill('#apiKey_key', pinnedApiKey);
  // the fresh admin has no picture, so use the one the kickstarted Richard has
  await page.evaluate(() => {
    for (const img of document.querySelectorAll('img')) if (/gravatar/.test(img.src)) img.src = 'http://localhost:8080/richard.webp';
    document.activeElement?.blur();
  });
  await page.waitForLoadState('networkidle');
}

export const shots = {
  'first-time-setup-dashboard': {
    fixedHeight: null,
    legacyVersion: true,
    prepare: preparation({
      beforeUserTabs: (page, ctx, { tag }) => tag('applications-nav', () => [...document.querySelectorAll('nav a[href="/admin/application/"]')].find(a => a.offsetParent)),
      afterFraming: pinRecentLogins,
    }),
  },
  'first-time-setup-application-listing': { legacyVersion: true, prepare: preparation({ afterControls: pinTenantManagerId }) },
  'first-time-setup-application-form': { legacyVersion: true, temporaryResources: [exampleApp] },
  'first-time-setup-application-details': { fixedHeight: null, legacyVersion: true, prepare: preparation({ beforeUserTabs: showClientCredentials }), temporaryResources: [exampleApp] },
  'first-time-setup-user-search': { legacyVersion: true, prepare: preparation({ beforeUserTabs: searchDinesh }), temporaryResources: [exampleApp] },
  'first-time-setup-registration-add': {
    legacyVersion: true,
    skipUserWait: true,
    prepare: preparation({ normalizeUser: normalizeUserMethods, beforeUserTabs: addRegistration }),
    temporaryResources: [exampleApp],
  },
  'first-time-setup-wizard': { fresh: true, prepare: showSetupWizard },
  'first-time-setup-api-key': { fresh: true, prepare: showSetupStep },
  'first-time-setup-email': { fresh: true, prepare: showSetupStep },
  'first-time-setup-license': { fresh: true, prepare: showSetupStep },
};
