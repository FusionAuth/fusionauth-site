import { baseUrl, defaultTenantId, apiRequest } from '../../../kit.mjs';
import { licensedFor170, ensure } from '../../../get-started/core-concepts/types/cimd-domains.mjs';

// matches the services in the token exchange delegation guide
async function createTokenExchangeServices() {
  try {
    if (!(await licensedFor170())) return;
    const tenantHeader = { 'X-FusionAuth-TenantId': defaultTenantId };
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { tokenExchangeConfiguration: { enabled: true, policyEngine: 'ENTITY' } } }, tenantHeader);
    const entityTypeId = '5f1d3b7a-9c2e-4d6f-8a1b-3e5c7a9d1f2b';
    const emailEntityId = '8e2a4c6b-1d3f-4a5e-9b7c-2d4f6a8c0e1b';
    const todoEntityId = '3c5e7a9b-2d4f-4b6a-8c1e-5f7a9b2d4c6e';
    const todoAppId = '9a1c3e5b-7d2f-4e6a-8b0c-1d3f5a7c9e2b';
    await ensure(`/api/entity/type/${entityTypeId}`, { entityType: { name: 'API Service' } }, false);
    await ensure(`/api/entity/${emailEntityId}`, { entity: { name: 'Email Service', clientId: 'email-service', type: { id: entityTypeId } } });
    const todoIsNew = await apiRequest(`/api/entity/${todoEntityId}`, 'GET', undefined, tenantHeader).then(() => false, e => {
      if (!/: 404 /.test(e.message)) throw e;
      return true;
    });
    if (!todoIsNew) return;
    await apiRequest(`/api/entity/${todoEntityId}`, 'POST', { entity: { name: 'To-do Service', clientId: 'todo-service', clientSecret: 'change-this-secret', actAsTokenExchangeClient: true, type: { id: entityTypeId } } }, tenantHeader);
    await apiRequest(`/api/entity/${emailEntityId}/grant`, 'POST', { grant: { recipientEntityId: todoEntityId } }, tenantHeader);

    // one exchange gives the token exchange log an entry; a throwaway app mints the subject token and is deleted after
    await ensure(`/api/application/${todoAppId}`, { application: { name: 'To-do App', oauthConfiguration: { clientSecret: 'todo-app-secret', enabledGrants: ['password'], requireClientAuthentication: true } } });
    const basic = (id, secret) => 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
    const form = { 'Content-Type': 'application/x-www-form-urlencoded' };
    let accessToken;
    // a new application can take a few seconds to reach the OAuth cache
    for (let i = 0; i < 10 && !accessToken; i++) {
      const r = await fetch(`${baseUrl}/oauth2/token`, { method: 'POST', headers: { ...form, Authorization: basic(todoAppId, 'todo-app-secret') },
        body: new URLSearchParams({ grant_type: 'password', username: 'richard@piedpiper.com', password: 'password', scope: 'openid offline_access' }) });
      accessToken = (await r.json()).access_token;
      if (!accessToken) await new Promise(res => setTimeout(res, 2000));
    }
    if (!accessToken) throw new Error('password grant for the token exchange subject token failed');
    const r = await fetch(`${baseUrl}/oauth2/token`, { method: 'POST', headers: { ...form, Authorization: basic('todo-service', 'change-this-secret') },
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange', subject_token: accessToken,
        subject_token_type: 'urn:ietf:params:oauth:token-type:access_token', audience: 'email-service', intent: 'send-reminder-email' }) });
    if (!r.ok) throw new Error(`token exchange failed: ${r.status} ${await r.text()}`);
    await apiRequest(`/api/application/${todoAppId}?hardDelete=true`, 'DELETE', undefined, tenantHeader);
  } catch (e) {
    throw new Error(`beforeAll: token exchange setup failed: ${e.message}`, { cause: e });
  }
}

export const resources = [createTokenExchangeServices];

export const shots = {
  'token-exchange-log': {},
  'tenant-token-exchange-enable': { band: "[data-section='token-exchange-settings']" },
};
