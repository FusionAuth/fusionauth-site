import { normalizeUserMethods } from '../_shared.mjs';
import { defaultTenantId, apiRequest, baseUrl } from '../kit.mjs';
import { migration, windowShot, migrationDetails, migrationOpenMenu, openDeleteMenu, migrationAddPolicy, connectorTenant } from './_shared.mjs';

const policyTenant = {
  order: 6,
  paths: [`/api/tenant/${migration.policyTenantId}`],
  create: async api => {
    await api(`/api/tenant/${migration.policyTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper migration' } });
  },
};

export const forgotPasswordTemplate = {
  order: 7,
  apply: async () => {
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    const originalTemplateId = tenant.emailConfiguration.forgotPasswordEmailTemplateId;
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { emailConfiguration: { forgotPasswordEmailTemplateId: '00000000-0000-0000-0000-400000000001' } } });
    return () => apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { emailConfiguration: { forgotPasswordEmailTemplateId: originalTemplateId ?? null } } });
  },
};

// the API can't add keys with the screenshot key, so the screenshot adds this one in the admin UI
const importKey = {
  order: 8,
  apply: async () => async () => {
    const page = await migration.context.newPage();
    await page.goto(`${baseUrl}/admin/api-key/`, { waitUntil: 'networkidle' });
    await page.evaluate(id => {
      const link = document.querySelector(`main a[href="/ajax/api-key/delete/${id}"]`);
      link.closest('[popover]')?.showPopover();
      link.click();
    }, migration.apiKeyId);
    await page.locator('.prime-dialog.open button[type=submit]').click();
    await page.waitForLoadState('networkidle');
    await page.close();
  },
};

export const shots = {
  'migration-add-tenant': windowShot({ before: page => page.fill('#tenant_name', 'Pied Piper') }),
  'migration-add-application': windowShot({
    before: async page => {
      await page.fill('#application_name', 'Pied Piper');
      for (const [role, column] of [['user', 'isDefault'], ['admin', 'isSuperRole']]) {
        await page.locator('#role-add-button').click();
        await page.waitForTimeout(300);
        const row = page.locator('#roles tbody tr').last();
        await row.locator('input[type=text]').first().fill(role);
        await row.locator(`input[type=checkbox][name*='${column}']`).check();
      }
    },
  }),
  'migration-api-key-details': windowShot({
    before: async page => {
      migration.context = page.context();
      if (!(await page.locator(`main a[href="/ajax/api-key/view/${migration.apiKeyId}"]`).count())) {
        await page.goto(`${baseUrl}/admin/api-key/add`, { waitUntil: 'networkidle' });
        await page.fill('#apiKeyId', migration.apiKeyId);
        await page.fill('#apiKey_name', 'Import key');
        await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'For user import');
        await page.fill('#apiKey_key', 'r8Uj2qR4cKzWm7XvNp3tYb6dFh9LsGa1EwQo5Ti0MnPx_Kc');
        await page.evaluate(() => document.querySelector("input[type=checkbox][name=\"apiKey.permissions.endpoints['/api/user/import']\"][value=POST]").click());
        await page.evaluate(() => document.getElementById('api-key-form').requestSubmit());
        await page.waitForURL(u => /\/admin\/api-key\/?$/.test(u.pathname));
        await page.waitForLoadState('networkidle');
      }
      await migrationDetails(page, `/ajax/api-key/view/${migration.apiKeyId}`);
    },
    temporaryState: [importKey],
  }),
  'migration-add-connector': windowShot({ after: page => migrationOpenMenu(page, page.locator('main el-dropdown button').first()), temporaryResources: [connectorTenant] }),
  'migration-add-connector-policy': windowShot({ before: page => migrationAddPolicy(page, 'Legacy User API', false), temporaryResources: [policyTenant, connectorTenant] }),
  'migration-delete-connector-policy': windowShot({
    before: page => migrationAddPolicy(page, 'Legacy User API', true),
    after: (page, tag) => openDeleteMenu(page, tag, page.locator('#connectors tbody tr', { hasText: 'Legacy User API' })),
    temporaryResources: [policyTenant, connectorTenant],
  }),
  'migration-reset-user-password': windowShot({
    stages: { normalizeUser: normalizeUserMethods },
    after: async (page, tag) => {
      await migrationOpenMenu(page, page.locator('header el-dropdown button'));
      await tag('migration-reset', () => document.querySelector('[data-menu-copy] #send-password-reset'));
    },
    temporaryState: [forgotPasswordTemplate],
  }),
};
