import { defaultTenantId } from '../../kit.mjs';
import { migration, windowShot } from '../_shared.mjs';

// the import test tenant, with an application and two registered users
const importTenant = {
  order: 5,
  paths: [`/api/tenant/${migration.importTenantId}`, `/api/application/${migration.importAppId}`],
  create: async api => {
    const headers = { 'X-FusionAuth-TenantId': migration.importTenantId };
    await api(`/api/tenant/${migration.importTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Import test' } });
    await api(`/api/application/${migration.importAppId}`, 'POST', { application: { name: 'Import test application', oauthConfiguration: {
      authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code', 'refresh_token'], clientSecret: 'import-test-secret-not-for-production',
    } } }, headers);
    for (const [id, email, firstName, lastName] of migration.importUsers) {
      await api(`/api/user/${id}`, 'POST', { user: { email, firstName, lastName, password: 'password' }, skipVerification: true }, headers);
      await api(`/api/user/registration/${id}`, 'POST', { registration: { applicationId: migration.importAppId } }, headers);
    }
  },
};

async function fillImportKey(page) {
  await page.fill('#apiKey_name', 'Import key');
  await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'For user import');
  await page.fill('#apiKey_key', 'r8Uj2qR4cKzWm7XvNp3tYb6dFh9LsGa1EwQo5Ti0MnPx_Kc');
  await page.locator('#tenantId').selectOption(migration.importTenantId);
}

// the import key with user import and the given POST permissions, its window starting a few rows above them
async function fillImportKeyPermissions(page, extraEndpoints) {
  await fillImportKey(page);
  await page.evaluate(endpoints => {
    for (const input of document.querySelectorAll('main input[type=checkbox][name^="apiKey.permissions.endpoints"]')) {
      const wanted = input.value === 'POST' && endpoints.some(endpoint => input.name === `apiKey.permissions.endpoints['${endpoint}']`);
      if (input.checked !== wanted) input.click();
    }
    const rows = endpoints.map(endpoint => {
      const row = [...document.querySelectorAll('main tr')].find(r => r.querySelector('td')?.textContent.trim() === endpoint);
      row.dataset.hl = 'migration-permission-' + endpoint.split('/').at(-1);
      return row;
    });
    // The social guide explicitly keeps the link permission outside this view.
    const visible = rows.filter(row => !row.textContent.includes('/api/identity-provider/link')).sort((a, b) => a.offsetTop - b.offsetTop);
    let above = visible[0];
    for (let i = 0; i < 6; i++) above = above.previousElementSibling ?? above;
    above.dataset.hl = 'migration-scroll';
  }, ['/api/user/import', ...extraEndpoints]);
}

const permissionsShot = (...extraEndpoints) =>
  windowShot({ fixedHeight: "[data-hl='migration-scroll']", before: page => fillImportKeyPermissions(page, extraEndpoints), temporaryResources: [importTenant] });

export { importTenant, fillImportKey, permissionsShot };
