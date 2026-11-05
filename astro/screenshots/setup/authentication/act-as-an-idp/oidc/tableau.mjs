import { authShot, allowCors, auth } from '../../_shared.mjs';
import { signingKey, useSigningKey } from './_shared.mjs';

const tableauApp = {
  order: 28,
  paths: [`/api/application/${auth.tableauAppId}`],
  create: async api => {
    await api(`/api/application/${auth.tableauAppId}`, 'POST', { application: {
      name: 'Tableau Cloud OIDC', oauthConfiguration: { clientSecret: 'tableau-secret-not-for-production', enabledGrants: ['authorization_code', 'refresh_token'] },
    } });
  },
};

// the key list, with the Generate RSA item of its add menu open
async function openGenerateMenu(page) {
  await page.evaluate(() => {
    document.querySelectorAll('main tbody tr').forEach((tr, i) => {
      const cell = tr.querySelector('td');
      if (cell) cell.textContent = `00000000-0000-0000-0000-f300000001${String(i).padStart(2, '0')}`;
    });
  });
  await page.evaluate(() => {
    const item = document.getElementById('generate-rsa');
    item?.closest('[popover]').showPopover();
    if (item) item.dataset.hl = 'generate-rsa-item';
    const nav = [...document.querySelectorAll('nav a[href="/admin/key/"]')].find(a => a.offsetParent);
    if (nav) nav.dataset.hl = 'key-master-nav';
    document.getElementById('key-actions-primary').parentElement.dataset.hl = 'key-actions';
  });
  await page.waitForTimeout(500);
}

export const shots = {
  'authenticate-tableau-cors': authShot({ switch: ['systemConfiguration_corsConfiguration_enabled'], fixedHeight: 'Cross-origin requests' }, (page, ctx, info) =>
    allowCors(page, info, ['https://sso.online.tableau.com', 'https://prod-ch-a.online.tableau.com'])),
  'authenticate-tableau-key-generate-menu': authShot({ fixedHeight: null }, async (page, ctx, { freezeMenu }) => {
    await openGenerateMenu(page);
    await freezeMenu('[popover]:has(#generate-rsa)');
  }),
  'authenticate-tableau-key-generate-dialog': authShot({ fixedHeight: null }, async page => {
    await openGenerateMenu(page);
    await page.locator('#generate-rsa').click();
    await page.locator('.prime-dialog.open').waitFor();
    await page.waitForTimeout(500);
    await page.locator('.prime-dialog.open input[name="key.name"]').fill('Tableau RS256 Key');
    await page.evaluate(() => document.activeElement?.blur());
  }),
  'authenticate-tableau-application-add': authShot({ select: { application_name: 'Tableau Cloud OIDC' }, fixedHeight: null }),
  'authenticate-tableau-application-oauth': authShot({
    select: { application_name: 'Tableau Cloud OIDC' },
    fixedHeight: '#application_oauthConfiguration_authorizedURLValidationPolicy-form-row',
  }, async (page, ctx, { showTab, setClientSecret }) => {
    await showTab();
    await setClientSecret('tableau-secret-not-for-production');
    await page.evaluate(() => {
      const grant = document.querySelector('#enabled-grants input[value=refresh_token]');
      if (!grant.checked) grant.click();
    });
  }),
  'authenticate-tableau-application-jwt': authShot({
    switch: ['application_jwtConfiguration_enabled'],
    select: { application_name: 'Tableau Cloud OIDC' },
    fixedHeight: null,
    temporaryResources: [signingKey],
    resourceArgs: { 22: ['Tableau RS256 Key'] },
  }, useSigningKey('Tableau')),
  'authenticate-tableau-application-details': authShot({ fixedHeight: null, temporaryResources: [tableauApp] }, async (page, ctx, { box, openView, row }) => {
    await openView(`/ajax/application/view/${auth.tableauAppId}`, 'OpenID Connect Discovery:');
    await row('discovery', 'OpenID Connect Discovery:');
    await box('client-credentials', [await row('id', 'Client Id:'), await row('auth', 'Client authentication:')]);
  }),
};
