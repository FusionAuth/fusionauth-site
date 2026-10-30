import { authShot, auth } from '../../_shared.mjs';
import { baseUrl } from '../../../../kit.mjs';

const laurie = {
  order: 20,
  paths: [`/api/user/${auth.laurieId}?hardDelete=true`],
  create: async api => {
    await api(`/api/user/${auth.laurieId}`, 'POST', { user: { email: 'laurie@raviga.com', username: 'laurie', password: 'password', firstName: 'Laurie', lastName: 'Bream' } });
  },
};

// the Certificate generator API key, added and removed through the admin UI
const certificateGeneratorKey = {
  order: 13,
  apply: async page => {
    await page.goto(`${baseUrl}/admin/api-key/add`, { waitUntil: 'networkidle' });
    await page.fill('#apiKeyId', auth.apiKeyId);
    await page.fill('#apiKey_name', 'Certificate generator');
    await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'Certificate generator');
    await page.fill('#apiKey_key', 'certificate-generator-key-not-for-production-NKU5Ypg');
    await page.locator('#endpoints tr').filter({ hasText: /^\s*\/api\/key\/import\s/ }).locator('input[value=POST]').check();
    await page.locator('#save-button').click();
    await page.waitForURL(u => u.pathname === '/admin/api-key/');
    for (let i = 0; ; i++) {
      if (await page.locator('main tbody tr').filter({ hasText: 'Certificate generator' }).count()) break;
      if (i === 60) throw new Error('Certificate generator key did not appear');
      await page.waitForTimeout(500);
      await page.reload({ waitUntil: 'networkidle' });
    }
    return async () => {
      const cleanup = await page.context().newPage();
      try {
        await cleanup.goto(`${baseUrl}/admin/api-key/`, { waitUntil: 'networkidle' });
        await cleanup.locator(`main a[href="/ajax/api-key/delete/${auth.apiKeyId}"]`).waitFor({ state: 'attached' });
        await cleanup.evaluate(id => {
          const link = [...document.querySelectorAll('a')].find(a => a.href.includes('/delete/') && a.href.includes(id));
          if (!link) throw new Error('API key delete link not found');
          link.closest('[popover]')?.showPopover();
          link.click();
        }, auth.apiKeyId);
        await cleanup.locator('.prime-dialog.open').waitFor();
        await cleanup.locator('.prime-dialog.open button').filter({ hasText: /Delete|Confirm/ }).first().click();
        await cleanup.locator('.prime-dialog.open').waitFor({ state: 'hidden' });
        await cleanup.waitForLoadState('networkidle');
      } finally { await cleanup.close(); }
    };
  },
};

export const shots = {
  'authenticate-aiven-api-key-add': authShot({ fixedHeight: "[data-scroll='api-key-endpoints']" }, async page => {
    await page.fill('#apiKey_name', 'Certificate generator');
    await page.fill('#apiKey_key', 'certificate-generator-key-not-for-production-NKU5Ypg');
    await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'Certificate generator');
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#endpoints tr')];
      const i = rows.findIndex(tr => tr.firstElementChild?.textContent.trim() === '/api/key/import');
      rows[i].querySelector('input[value=POST]').click();
      rows[i - 2].dataset.scroll = 'api-key-endpoints';
    });
    await page.evaluate(() => document.activeElement?.blur());
  }),
  'authenticate-aiven-api-keys': authShot({ fixedHeight: null, temporaryState: [certificateGeneratorKey] }, async page => {
    await page.locator('main tbody tr').filter({ hasText: 'Certificate generator' }).waitFor();
    await page.evaluate(() => {
      const row = [...document.querySelectorAll('main tbody tr')].find(tr => tr.textContent.includes('Certificate generator'));
      if (row) row.firstElementChild.dataset.hl = 'certificate-key';
    });
  }),
  'authenticate-aiven-user-add': authShot({ fixedHeight: null }, async (page, ctx, { box }) => {
    await page.fill('#user_email', 'laurie@raviga.com');
    await page.fill('#user_username', 'laurie');
    await page.check('#sendSetPasswordIdentityType-doNotSend');
    await page.fill('#user_password', 'password');
    await page.fill('#confirm_user_password', 'password');
    await page.waitForFunction(() => document.querySelector('#password-fields')?.style.height === 'auto');
    await page.evaluate(() => document.activeElement?.blur());
    await box('email-username', ['#user_email-form-row', '#user_username-form-row'], 8);
    await box('send-email', ['#sendSetPasswordIdentityType-form-row'], 8);
    await box('passwords', ['#user_password-form-row', '#confirm_user_password-form-row'], 8);
  }),
  'authenticate-aiven-user-registrations': authShot({ fixedHeight: null, temporaryResources: [laurie] }),
};
