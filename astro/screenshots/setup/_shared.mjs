import { generateKeyPairSync, createPublicKey } from 'crypto';
import { monicaId, gilfoyleId, familyId, printersTypeId, gavinId, dineshId, defaultTenantId, piedPiperAppId, richardId, projectRoot, baseUrl, apiKey } from './kit.mjs';

import { readFileSync } from 'fs';
import { join } from 'path';

const leftoversAppId = '00000000-0000-0000-0000-f70000000001';

const leftoversPrivateKey = readFileSync(join(projectRoot, 'screenshots/fixtures/leftovers-example-rsa.pem'), 'utf-8');

const leftoversCertificate = readFileSync(join(projectRoot, 'screenshots/fixtures/leftovers-example-rsa.crt'), 'utf-8');

const leftoversSigningKey = (name, kid) => ({
  name,
  kid,
  type: 'RSA',
  algorithm: 'RS256',
  privateKey: leftoversPrivateKey,
  certificate: leftoversCertificate,
  publicKey: createPublicKey(leftoversPrivateKey).export({ type: 'spki', format: 'pem' }),
});

async function configureLicense() {
  const tenantId = defaultTenantId;

  const appId = piedPiperAppId;

  if (process.env.FUSIONAUTH_LICENSE_KEY) {
    try {
      const licResp = await fetch(`${baseUrl}/api/reactor`, {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseId: process.env.FUSIONAUTH_LICENSE_KEY }),
      });
      // 409 = already activated, both are fine
      if (!licResp.ok && licResp.status !== 409) {
        throw new Error(`${licResp.status} ${await licResp.text()}`);
      } else {
        // poll until licensed: true (reactor activates asynchronously)
        const licDeadline = Date.now() + 15_000;
        while (Date.now() < licDeadline) {
          const statusResp = await fetch(`${baseUrl}/api/reactor`, { headers: { Authorization: apiKey } });
          const { status } = await statusResp.json();
          if (status?.licensed === true) {
            console.log('[screenshot] beforeAll: license active, webAuthn:', status.webAuthn);
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
        // enable WebAuthn on the tenant (both workflows)
        await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
          method: 'PATCH',
          headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: {
              webAuthnConfiguration: {
                enabled: true,
                bootstrapWorkflow: { enabled: true },
                reauthenticationWorkflow: { enabled: true },
              },
            },
          }),
        });
        // ensure Richard is registered with Pied Piper (idempotent -- 400 if already exists)
        await fetch(`${baseUrl}/api/user/registration/${richardId}`, {
          method: 'POST',
          headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: { applicationId: appId, roles: ['admin'] } }),
        });
      }
    } catch (e) {
      throw new Error(`beforeAll: license setup failed: ${e.message}`, { cause: e });
    }
  }
}

export const resources = [configureLicense, populateUserTabs];

export { leftoversAppId, leftoversSigningKey, leftoversPrivateKey, leftoversCertificate };

export async function normalizeUserMethods(page, ctx, info) {
  const { pathname, apiKey } = info;
  if (pathname === `/admin/user/manage/${dineshId}`) {
    const headers = { Authorization: apiKey };
    const { user } = await (await fetch(`${baseUrl}/api/user/${dineshId}`, { headers })).json();
    const grants = [];
    for (const n of [1, 2]) {
      const r = await fetch(`${baseUrl}/api/entity/00000000-0000-0000-0000-b0000000000${n}/grant?userId=${dineshId}`, { headers });
      if (r.ok) grants.push((await r.json()).grant);
    }
    const ids = [...user.registrations, ...user.memberships, ...grants].map(x => x.id);
    const methods = (user.twoFactor?.methods ?? []).map(m => m.id);
    await page.evaluate(
      ([ids, methods]) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          let text = node.textContent;
          ids.forEach((id, i) => {
            text = text.replaceAll(id, `00000000-0000-0000-0000-f0000000000${i + 1}`);
          });
          methods.forEach((id, i) => {
            text = text.replaceAll(`"${id}"`, `"M${i + 1}AB"`).replace(new RegExp(`^(\\s*)${id}(\\s*)$`), `$1M${i + 1}AB$2`);
          });
          node.textContent = text.replace(/\b1\d{12}\b/g, '1790000000000');
        }
      },
      [ids, methods],
    );
  }
}

async function populateUserTabs() {
  const tenantId = defaultTenantId;

  const appId = piedPiperAppId;

  const api = async (method, path, body) => {
    const r = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
      body: body && JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`beforeAll: ${method} ${path} failed: ${r.status} ${await r.text()}`);
    return r.json().catch(() => ({}));
  };
  const licensed = !!process.env.FUSIONAUTH_LICENSE_KEY;
  await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { allowTokenRefresh: true, generateRefreshTokens: true } } });
  // Application settings propagate after the API update succeeds.
  const refreshDeadline = Date.now() + 120_000;
  while (!(await api('POST', '/api/login', { loginId: 'monica@raviga.com', password: 'password', applicationId: appId })).refreshToken) {
    if (Date.now() >= refreshDeadline) throw new Error('beforeAll: refresh token generation did not become ready');
    await new Promise(r => setTimeout(r, 500));
  }
  await api('DELETE', `/api/jwt/refresh?userId=${monicaId}`);
  for (const [name, type] of [
    ['macOS Chrome', 'BROWSER'],
    ['iPhone', 'MOBILE'],
  ]) {
    const login = await api('POST', '/api/login', {
      loginId: 'dinesh@piedpiper.com',
      password: 'password',
      applicationId: appId,
      ipAddress: '127.0.0.1',
      metaData: { device: { name, type } },
    });
    if (!login.refreshToken) throw new Error(`beforeAll: no ${name} session`);
  }
  await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { allowTokenRefresh: false, generateRefreshTokens: false } } });
  await api('PATCH', `/api/user/${dineshId}`, {
    user: {
      birthDate: '1988-03-11',
      mobilePhone: '+15555550123',
      data: { company: 'Pied Piper', hometown: 'Karachi', occupation: 'Software Engineer' },
      twoFactor: {
        methods: [
          { method: 'authenticator', secret: 'N2YUNLQVJAXECEMGTAQXIXOYQ4AQBIH3' },
          ...(licensed
            ? [
                { method: 'email', email: 'dinesh@piedpiper.com' },
                { method: 'sms', mobilePhone: '+15555550123' },
              ]
            : []),
        ],
      },
    },
  });
  await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { familyConfiguration: { enabled: true } } });
  await api('PATCH', `/api/user/${gilfoyleId}`, { user: { birthDate: '1985-07-02' } });
  await api('POST', `/api/user/family/${familyId}`, { familyMember: { userId: dineshId, owner: true, role: 'Adult' } });
  await api('PUT', `/api/user/family/${familyId}`, { familyMember: { userId: gilfoyleId, role: 'Adult' } });
  await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { familyConfiguration: { enabled: false } } });
  await api('POST', '/api/identity-provider/00000000-0000-0000-0000-900000000001', {
    identityProvider: {
      type: 'OpenIDConnect',
      name: 'Pied Piper IdP',
      enabled: true,
      oauth2: {
        client_id: 'pied-piper',
        client_secret: 'not-a-secret',
        authorization_endpoint: 'https://idp.example.com/authorize',
        token_endpoint: 'https://idp.example.com/token',
        userinfo_endpoint: 'https://idp.example.com/userinfo',
        scope: 'openid',
      },
    },
  });
  await api('POST', '/api/identity-provider/link', {
    identityProviderId: '00000000-0000-0000-0000-900000000001',
    userId: dineshId,
    identityProviderUserId: 'dinesh',
    displayName: 'dinesh@piedpiper.com',
  });
  await api('POST', '/api/consent/00000000-0000-0000-0000-c00000000001', { consent: { name: 'Marketing emails', defaultMinimumAgeForSelfConsent: 13 } });
  await api('POST', '/api/user/consent', { userConsent: { consentId: '00000000-0000-0000-0000-c00000000001', userId: dineshId, giverUserId: dineshId } });
  await api('POST', '/api/user-action/00000000-0000-0000-0000-d00000000001', { userAction: { name: 'Bought subscription', temporal: true } });
  await api('POST', '/api/user-action/00000000-0000-0000-0000-d00000000002', { userAction: { name: 'Sent welcome pack' } });
  await api('POST', '/api/user/comment', { userComment: { userId: dineshId, commenterId: richardId, comment: 'Asked to keep his account' } });
  await api('POST', '/api/user/action', {
    broadcast: false,
    action: { actioneeUserId: dineshId, actionerUserId: richardId, comment: 'Hoodie and stickers', userActionId: '00000000-0000-0000-0000-d00000000002' },
  });
  await api('POST', '/api/user/action', {
    broadcast: false,
    action: {
      actioneeUserId: dineshId,
      actionerUserId: richardId,
      comment: 'Paid by card',
      expiry: Date.now() + 30 * 864e5,
      userActionId: '00000000-0000-0000-0000-d00000000001',
    },
  });
  if (licensed) {
    await api('POST', `/api/entity/type/${printersTypeId}`, {
      entityType: {
        name: 'Printers',
        permissions: [
          { name: 'Print', description: 'Send print jobs', isDefault: true },
          { name: 'Settings', description: 'Change printer settings' },
        ],
      },
    });
    for (const [id, name, permissions] of [
      ['00000000-0000-0000-0000-b00000000001', 'Front Office Printer', ['Print', 'Settings']],
      ['00000000-0000-0000-0000-b00000000002', 'Back Office Printer', ['Print']],
    ]) {
      await api('POST', `/api/entity/${id}`, {
        entity: { name, type: { id: printersTypeId }, clientId: id, clientSecret: 'printer-secret-not-for-production' },
      });
      await api('POST', `/api/entity/${id}/grant`, { grant: { userId: dineshId, permissions } });
    }
    const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    await api('POST', '/api/webauthn/import', {
      credentials: [
        {
          id: '00000000-0000-0000-0000-e00000000001',
          userId: dineshId,
          name: 'MacBook Touch ID',
          displayName: 'dinesh@piedpiper.com',
          algorithm: -7,
          attestationType: 'none',
          credentialId: 'ZGluZXNoLXBhc3NrZXk',
          publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
          relyingPartyId: 'localhost',
          discoverable: true,
          authenticatorSupportsUserVerification: true,
          signCount: 0,
          data: {},
        },
      ],
    });
  }
  await api('DELETE', `/api/user/${gavinId}`);
}
