import { preparation } from '../../kit.mjs';
import { leftovers } from '../_shared.mjs';
import { gatewayApp, fillGatewayApplication } from './_shared.mjs';

async function showApplicationId(page, ctx, { tag }) {
  const row = page.locator('tr').filter({ hasText: 'Pied Piper Gateway' });
  await row.locator('a[href*="/ajax/application/view/"]').evaluate(el => el.click());
  await page.locator('.prime-dialog.open').waitFor();
  await tag('leftovers-application-id', () => [...document.querySelectorAll('.prime-dialog.open tr')].find(tr => tr.firstElementChild?.textContent.trim() === 'Id:'));
  await page.evaluate(() => { const row = [...document.querySelectorAll('tr')].find(tr => tr.textContent.includes('Tenant manager')); if (row?.querySelectorAll('td')[1]) row.querySelectorAll('td')[1].textContent = '00000000-0000-0000-0000-f70000000005'; });
}

async function showPublicKey(page, ctx, { tag }) {
  const row = page.locator('tr').filter({ hasText: 'Pied Piper Gateway signing key' }).first();
  await row.locator('a[href*="/ajax/key/view/"]').evaluate(el => el.click());
  await page.locator('.prime-dialog.open').waitFor();
  await tag('leftovers-public-key', () => [...document.querySelectorAll('.prime-dialog.open pre')].find(pre => pre.textContent.includes('BEGIN PUBLIC KEY'))?.closest('tr'));
  await tag('leftovers-public-heading', () => {
    const heading = [...document.querySelectorAll('.prime-dialog.open h3')].find(el => el.textContent.trim() === 'Public Key');
    if (!heading) return null;
    const span = document.createElement('span');
    span.textContent = heading.textContent.trim();
    heading.replaceChildren(span);
    return span;
  });
  await page.locator('[data-hl="leftovers-public-key"]').evaluate(el => {
    const main = el.closest('main');
    main.scrollTop = el.offsetTop - 80;
  });
  await page.evaluate(() => {
    const dialog = document.querySelector('.prime-dialog.open');
    const text = [...dialog.querySelectorAll('h3')].find(el => el.textContent.trim() === 'Public Key');
    text?.scrollIntoView({ block: 'start' });
  });
}

export const shots = {
  'leftovers-gateway-tenant-issuer': {
    prepare: preparation({ beforeSizing: leftovers(page => page.fill('#tenant_issuer', 'https://local.fusionauth.io')) }),
    temporaryResources: [gatewayApp],
  },
  'leftovers-gateway-application-create-jwt-both-keys': {
    switch: ['application_jwtConfiguration_enabled'],
    fixedHeight: null,
    prepare: preparation({ beforeSizing: leftovers(page => fillGatewayApplication(page, ['accessTokenKeyId', 'idTokenKeyId'])) }),
    temporaryResources: [gatewayApp],
  },
  'leftovers-gateway-application-id': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers(showApplicationId) }), temporaryResources: [gatewayApp] },
  'leftovers-gateway-public-key': {
    fixedHeight: null,
    textPadding: 4,
    prepare: preparation({ beforeSizing: leftovers(showPublicKey, { pinKeyIds: true }) }),
    temporaryResources: [gatewayApp],
  },
};
