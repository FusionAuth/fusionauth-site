import { defaultTenantId, preparation, apiRequest } from '../../../kit.mjs';

export const cimdDomainId = '7d3c9a2e-41f6-4b8e-9c05-2e6f1a8b3d47';

// true when the license has the 1.70.0 CIMD and token exchange features
export const licensedFor170 = async () => {
  const { status } = await apiRequest('/api/reactor');
  return status?.cimd === 'ACTIVE' && status?.tokenExchange === 'ACTIVE';
};

// create once, keyed by a fixed id
export const ensure = async (path, body, tenantScoped = true) => {
  const headers = tenantScoped ? { 'X-FusionAuth-TenantId': defaultTenantId } : {};
  try {
    await apiRequest(path, 'GET', undefined, headers);
  } catch (e) {
    if (!/: 404 /.test(e.message)) throw e;
    await apiRequest(path, 'POST', body, headers);
  }
};

async function createCimdDomain() {
  try {
    if (!(await licensedFor170())) return;
    await ensure(`/api/cimd/domain/${cimdDomainId}`, { domain: {
      name: 'Claude', domain: 'https://claude.ai', authorizedResourceUris: ['https://mcp.piedpiper.com/mcp'],
      consentMode: 'AlwaysPrompt', gracePeriodInSeconds: 600,
      providedScopePolicy: { address: { enabled: false, required: false }, email: { enabled: true, required: false }, phone: { enabled: false, required: false }, profile: { enabled: true, required: false } },
    } });
    await ensure(`/api/cimd/domain/${cimdDomainId}/scope/b2e4f6a8-1c3d-4e5f-8a9b-0c1d2e3f4a5b`, { scope: {
      name: 'files:read', description: 'Read access to Pied Piper files.',
      defaultConsentMessage: 'View your files', defaultConsentDetail: 'Lets the app list and download your Pied Piper files.',
    } });
  } catch (e) {
    throw new Error(`beforeAll: CIMD setup failed: ${e.message}`, { cause: e });
  }
}

export const resources = [createCimdDomain];

// the opening link sits in a closed action menu, so click it from script
const openDialog = selector => preparation({ beforeUserTabs: async page => {
  const opened = await page.evaluate(sel => {
    const link = document.querySelector(sel);
    link?.click();
    return !!link;
  }, selector);
  if (!opened) throw new Error(`dialog link not found: ${selector}`);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForLoadState('networkidle');
} });

export const shots = {
  'cimd-domain-list': {},
  'cimd-domain-add': {},
  'cimd-domain-edit': {},
  'cimd-domain-delete': {},
  'cimd-domain-scope-list': {},
  'cimd-domain-view': { dialog: true, prepare: openDialog('a[href*="/ajax/cimd-domain/view/"]') },
  'cimd-domain-scope-add': { dialog: true, prepare: openDialog('a[href*="/ajax/cimd-domain/scope/add"]') },
  'cimd-domain-scope-edit': { dialog: true, prepare: openDialog('a[href*="/ajax/cimd-domain/scope/edit"]') },
};
