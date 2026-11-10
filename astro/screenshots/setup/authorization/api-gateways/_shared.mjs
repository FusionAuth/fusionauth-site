import { leftoversAppId, leftoversSigningKey } from '../../_shared.mjs';

const leftoversScopeId = '00000000-0000-0000-0000-f70000000002';
const leftoversKeyId = '00000000-0000-0000-0000-f70000000004';

const gatewayApp = {
  order: 34,
  paths: [`/api/application/${leftoversAppId}`, `/api/key/${leftoversKeyId}`],
  create: async api => {
    await api(`/api/key/import/${leftoversKeyId}`, 'POST', { key: leftoversSigningKey('Pied Piper Gateway signing key', 'pied-piper-gateway') });
    const signingKey = { id: leftoversKeyId };
    await api(`/api/application/${leftoversAppId}`, 'POST', { application: {
      name: 'Pied Piper Gateway',
      jwtConfiguration: { enabled: true, accessTokenKeyId: signingKey.id, idTokenKeyId: signingKey.id },
      oauthConfiguration: {
        clientSecret: 'pied-piper-gateway-example-secret', authorizedRedirectURLs: ['https://local.fusionauth.io/callback'], enabledGrants: ['authorization_code', 'refresh_token'],
        relationship: 'ThirdParty', consentMode: 'AlwaysPrompt', providedScopePolicy: { email: { enabled: true, required: true }, phone: { enabled: true, required: false } },
      },
    } });
    await api(`/api/application/${leftoversAppId}/scope/${leftoversScopeId}`, 'POST', { scope: {
      name: 'data:read', description: "Provides an application read-only access to a user's data", defaultConsentMessage: 'View your data',
      defaultConsentDetail: 'This will provide the requesting application read-only access to your data.', required: true,
    } });
  },
};

const signingKeyHighlights = { accessTokenKeyId: 'leftovers-access-signing-key', idTokenKeyId: 'leftovers-id-signing-key' };

export async function tagSigningKeys(page, fields) {
  for (const field of fields) await page.locator(`#${field}-input`).evaluate((el, hl) => { el.closest('fieldset').dataset.hl = hl; }, signingKeyHighlights[field]);
}

// a new gateway application signing the given tokens with the gateway key
export async function fillGatewayApplication(page, fields) {
  await page.fill('#application_name', 'Pied Piper Gateway');
  for (const field of fields) {
    await page.locator(`#${field} button`).click();
    await page.locator(`#${field} [role=option]`).filter({ hasText: 'Pied Piper Gateway signing key (RS256)' }).click();
  }
  await tagSigningKeys(page, fields);
}

// temporaryResources34 is the name get-started/core-concepts/scopes.mjs imports
export { leftoversScopeId, leftoversKeyId, gatewayApp, gatewayApp as temporaryResources34 };
