import { normalizeUserMethods } from '../../../_shared.mjs';
import { preparation, runtime, baseUrl, defaultTenantId, selectTab } from '../../../kit.mjs';
import { leftovers } from '../_shared.mjs';
import { gatewayApp, tagSigningKeys } from './_shared.mjs';

// the gateway API key, created through a temporary key manager
const gatewayApiKey = {
  order: 22,
  apply: async () => {
    const page = await runtime.leftoversContext.newPage();
    const managerId = '00000000-0000-0000-0000-f70000000009';
    const managerKey = 'leftovers-temporary-key-manager';
    const keyId = '00000000-0000-0000-0000-f7000000000a';
    const api = async (path, method, body) => {
      const r = await fetch(`${baseUrl}${path}`, { method, headers: { Authorization: managerKey, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
      if (!r.ok) throw new Error(`Leftovers API key ${method}: ${r.status} ${await r.text()}`);
    };
    try {
      await page.goto(`${baseUrl}/admin/api-key/add`, { waitUntil: 'networkidle' });
      await page.fill('#apiKeyId', managerId);
      await page.fill('#apiKey_name', 'Leftovers temporary manager');
      await page.fill('#apiKey_key', managerKey);
      await page.locator('#apiKey_keyManager').check({ force: true });
      await page.locator('main button[type=submit]').click();
      await page.waitForURL(u => u.pathname === '/admin/api-key/');
      await api(`/api/api-key/${keyId}`, 'POST', { apiKey: { name: 'Pied Piper Gateway', key: 'pied-piper-gateway-example-api-key', tenantId: defaultTenantId, permissions: { endpoints: { '/api/login': ['POST'] } } } });
    } finally {
      await page.close();
    }
    return async () => {
      await api(`/api/api-key/${keyId}`, 'DELETE');
      await api(`/api/api-key/${managerId}`, 'DELETE');
    };
  },
};

async function allowLogin(page) {
  await page.locator('[name="apiKey.metaData.attributes[\'description\']"]').fill('Pied Piper Gateway');
  await page.fill('#apiKey_key', 'pied-piper-gateway-example-api-key');
  await page.fill('#apiKey_name', 'Pied Piper Gateway');
  const row = page.locator('tr').filter({ has: page.locator('input[name="apiKey.permissions.endpoints[\'/api/login\']"]') });
  await row.locator('input[value="POST"]').check({ force: true });
  await row.evaluate(el => { el.dataset.hl = 'leftovers-login-permission'; });
  await row.scrollIntoViewIfNeeded();
}

async function findApiKey(page) {
  await page.fill('#s_nameOrDescription', 'Pied Piper Gateway');
  await page.locator('#s_nameOrDescription').evaluate(el => el.form.requestSubmit());
  await page.waitForLoadState('networkidle');
  await page.locator('tbody tr').first().evaluate(el => { el.dataset.hl = 'leftovers-key'; });
  await page.locator('tbody tr a').filter({ hasText: /…/ }).first().click();
}

async function showRegistrations(page) {
  await selectTab(page, 'Registrations');
  await page.locator('a:has-text("Add registration"), button:has-text("Add registration")').first().evaluate(el => { el.dataset.hl = 'leftovers-add-registration'; });
}

export const shots = {
  'leftovers-gateway-application-oauth': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers() }), temporaryResources: [gatewayApp] },
  'leftovers-gateway-application-jwt': {
    fixedHeight: null,
    prepare: preparation({ beforeSizing: leftovers(page => tagSigningKeys(page, ['accessTokenKeyId', 'idTokenKeyId'])) }),
    temporaryResources: [gatewayApp],
  },
  'leftovers-gateway-api-key-permissions': {
    fixedHeight: null,
    // the permission row stays scrolled into view
    prepare: preparation({ beforeSizing: leftovers(allowLogin, { scrollTop: false }) }),
    temporaryResources: [gatewayApp],
  },
  'leftovers-gateway-api-key': {
    prepare: preparation({ beforeSizing: leftovers(findApiKey) }),
    temporaryResources: [gatewayApp],
    temporaryState: [gatewayApiKey],
  },
  'leftovers-gateway-user-registration': {
    prepare: preparation({ normalizeUser: normalizeUserMethods, beforeSizing: leftovers(showRegistrations) }),
    temporaryResources: [gatewayApp],
  },
};
