import { execFileSync } from 'child_process';
import { preparation, apiRequest, defaultTenantId, richardId, projectRoot } from '../kit.mjs';
import { useDocsHost } from '../get-started/_shared.mjs';

const piedPiperOidcId = '00000000-0000-0000-0000-f30000000040';
const idpTypes = ['OpenIDConnect', 'SAMLv2'];

// Richard opens the Tenant Manager as its admin, with OpenID Connect and SAML providers allowed in it
const tenantManagerAccess = {
  order: 39,
  apply: async () => {
    // FusionAuth creates the Tenant manager application with a new id on each start
    const { applications } = await apiRequest('/api/application');
    const appId = applications.find(app => app.name === 'Tenant manager').id;
    await apiRequest(`/api/user/registration/${richardId}`, 'POST', { registration: { applicationId: appId, roles: ['admin'] } });
    for (const type of idpTypes) await apiRequest(`/api/tenant-manager/identity-provider/${type}`, 'POST', { typeConfiguration: { enabled: true, linkingStrategy: 'LinkByEmail' } });
    return async () => {
      for (const type of idpTypes) await apiRequest(`/api/tenant-manager/identity-provider/${type}`, 'DELETE');
      await apiRequest(`/api/user/registration/${richardId}/${appId}`, 'DELETE');
    };
  },
};

// The Tenant Manager only lists providers it created, which the API can't mark, so the database does.
const piedPiperOidc = {
  order: 40,
  paths: [`/api/identity-provider/${piedPiperOidcId}`],
  create: async api => {
    await api(`/api/identity-provider/${piedPiperOidcId}`, 'POST', { identityProvider: {
      type: 'OpenIDConnect', name: 'Pied Piper OIDC', enabled: true, tenantId: defaultTenantId, linkingStrategy: 'LinkByEmail',
      oauth2: { client_id: 'piedpiper', client_secret: 'piedpiper-secret', scope: 'openid email profile',
        authorization_endpoint: 'https://accounts.piedpiper.com/o/oauth2/v2/auth', token_endpoint: 'https://piedpiper.com/token', userinfo_endpoint: 'https://openidconnect.piedpiper.com/v1/userinfo' },
    } });
    const sql = `update identity_providers set source = 'Tenant Manager' where id = '${piedPiperOidcId}'`;
    execFileSync('docker', ['compose', '-f', 'screenshots/docker-compose.yml', 'exec', '-T', 'db', 'psql', '-U', 'fusionauth', '-q', '-c', sql], { cwd: projectRoot });
  },
};

// shows the row's action menu in a copy that stays put for the screenshot
async function openActionMenu(page) {
  await page.locator('main el-dropdown button').filter({ hasText: /Select/ }).first().click();
  const menu = page.locator('main el-menu').filter({ hasText: /Edit/ }).first();
  await menu.waitFor({ state: 'visible' });
  await menu.evaluate(menu => {
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

// the Tenant Manager's CSP refuses the styles the generator and the shared steps add
async function allowStyles(context) {
  await context.route('**/tenant-manager/**', async route => {
    const response = await route.fetch();
    const headers = { ...response.headers() };
    delete headers['content-security-policy'];
    await route.fulfill({ response, headers });
  });
}

export const resources = [allowStyles];

const tenantManager = (stages = {}, shot = {}) => ({
  temporaryState: [tenantManagerAccess],
  prepare: preparation({ ...stages, beforeSizing: async (page, ctx, info) => {
    await stages.beforeSizing?.(page, ctx, info);
    await useDocsHost(page);
  } }),
  ...shot,
});
const withIdp = (stages, shot) => tenantManager(stages, { temporaryResources: [piedPiperOidc], ...shot });

export const shots = {
  'tenant-manager-users': tenantManager(),
  'tenant-manager-edit-user': tenantManager({}, { fixedHeight: null }),
  'tenant-manager-sso': withIdp({ finish: openActionMenu }),
  'tenant-manager-edit-idp': withIdp({}, { fixedHeight: null }),
  'tenant-manager-test-start': withIdp(),
};
