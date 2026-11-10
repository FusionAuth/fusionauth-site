import { authShot, auth } from '../_shared.mjs';
import { apiRequest, defaultTenantId, removeTwoFactor, richardId, totpSecret, selectTab, baseUrl, runtime, totpCode } from '../../kit.mjs';

const mfaTenant = {
  order: 9,
  apply: async () => {
    const emailTemplate = `/api/email/template/${auth.emailTemplateId}`, messageTemplate = `/api/message/template/${auth.messageTemplateId}`;
    await apiRequest(emailTemplate, 'POST', { emailTemplate: {
      name: 'Two Factor Authentication', defaultFromName: 'Pied Piper', defaultSubject: 'Your second factor code',
      defaultHtmlTemplate: '<p>Your verification code is ${code}</p>', defaultTextTemplate: 'Your verification code is ${code}',
    } });
    await apiRequest(messageTemplate, 'POST', { messageTemplate: { name: 'Default Two Factor Request', type: 'SMS', defaultTemplate: 'Your verification code is ${code}' } });
    await apiRequest(`/api/message/template/${auth.voiceTemplateId}`, 'POST', { messageTemplate: { name: 'Pied Piper Voice MFA', type: 'Voice', defaultTemplate: 'Your verification code is ${code}' } });
    await apiRequest(`/api/messenger/${auth.voiceMessengerId}`, 'POST', { messenger: {
      name: 'Pied Piper voice', type: 'Generic', messageTypes: ['Voice'], url: 'http://sms-mock:8081/', connectTimeout: 2000, readTimeout: 2000,
    } });
    const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
    await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { multiFactorConfiguration: {
      email: { enabled: true, templateId: auth.emailTemplateId },
      sms: { enabled: true, messengerId: '00000000-0000-0000-0000-500000000001', templateId: auth.messageTemplateId },
    } } });
    return async () => {
      await removeTwoFactor();
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
      await apiRequest(emailTemplate, 'DELETE');
      await apiRequest(messageTemplate, 'DELETE');
      await apiRequest(`/api/messenger/${auth.voiceMessengerId}`, 'DELETE');
      await apiRequest(`/api/message/template/${auth.voiceTemplateId}`, 'DELETE');
    };
  },
};

// Richard with these two-factor methods
const richardMethods = (order, methods) => ({
  order,
  apply: async () => {
    await removeTwoFactor();
    await apiRequest(`/api/user/${richardId}`, 'PATCH', { user: { twoFactor: { methods: methods.map(method => method === 'email'
      ? { method, email: 'richard@piedpiper.com' } : method === 'sms' ? { method, mobilePhone: '+15555550123' } : { method, secret: totpSecret.toString('base64') }) } } });
    const { user } = await apiRequest(`/api/user/${richardId}`);
    const ids = user.twoFactor.methods.map(m => m.id);
    // another of these states may have replaced the methods already
    return async () => {
      const { user } = await apiRequest(`/api/user/${richardId}`);
      if (user.twoFactor?.methods?.some(m => ids.includes(m.id))) await removeTwoFactor();
    };
  },
});

const emailMethod = richardMethods(10, ['email']);
const smsMethod = richardMethods(11, ['sms']);
const emailAndAuthenticator = richardMethods(12, ['email', 'authenticator']);

// the Multi-Factor tab, with the ids FusionAuth gives the methods on each run
async function showMethods(page) {
  await selectTab(page, 'Multi-Factor');
  const { user } = await apiRequest(`/api/user/${richardId}`);
  await page.evaluate(ids => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      ids.forEach((id, i) => { node.textContent = node.textContent.replace(new RegExp(`^(\\s*)${id}(\\s*)$`), `$1${['3N92', 'R97L'][i]}$2`); });
    }
  }, (user.twoFactor?.methods ?? []).map(m => m.id));
}

async function signIn(page, ctx, { hostedLogin }) {
  await hostedLogin('richard@piedpiper.com');
  await page.waitForURL(/\/oauth2\/two-factor/);
}

async function selfServiceMethods(page, ctx, { hostedLogin, url, oauthLoginUrl }) {
  runtime.savedSso ??= (await page.context().cookies(baseUrl)).find(c => c.name === 'fusionauth.sso');
  await page.goto(oauthLoginUrl + '&prompt=login', { waitUntil: 'networkidle' });
  await hostedLogin('richard@piedpiper.com');
  const { user } = await apiRequest(`/api/user/${richardId}`);
  const method = user.twoFactor.methods.find(m => m.method === 'authenticator');
  await page.locator(`input[type=radio][value="${method.id}"]`).check();
  if (!await page.locator('input[name=code]').isVisible()) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('input[name=code]').fill(totpCode());
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await page.waitForURL(/example\.com/);
  await page.goto(url, { waitUntil: 'networkidle' });
  if (new URL(page.url()).pathname.startsWith('/oauth2/two-factor')) {
    const option = page.locator(`input[type=radio][value="${method.id}"]`);
    if (await option.isVisible()) await option.check();
    if (!await page.locator('input[name=code]').isVisible()) await page.getByRole('button', { name: 'Continue', exact: true }).click();
    // A second MFA challenge cannot reuse the code just accepted for OAuth login.
    await page.waitForTimeout(30_000 - Date.now() % 30_000 + 1000);
    await page.locator('input[name=code]').fill(totpCode());
    await page.getByRole('button', { name: 'Verify', exact: true }).click();
    await page.waitForURL(u => !u.pathname.startsWith('/oauth2/two-factor'));
  }
  await page.getByText('Two-factor authentication', { exact: true }).waitFor({ timeout: 5000 }).catch(async () => {
    throw new Error(`MFA self-service landed on ${new URL(page.url()).pathname}: ${(await page.locator('body').innerText()).slice(0, 600)}`);
  });
}

export const shots = {
  'authenticate-tenant-mfa-methods': authShot({
    switch: ['tenant_multiFactorConfiguration_email_enabled', 'tenant_multiFactorConfiguration_sms_enabled', 'tenant_multiFactorConfiguration_voice_enabled'],
    select: { tenant_multiFactorConfiguration_voice_messengerId: auth.voiceMessengerId, tenant_multiFactorConfiguration_voice_templateId: auth.voiceTemplateId },
    fixedHeight: 'Authenticator settings',
    temporaryState: [mfaTenant],
  }),
  'authenticate-mfa-admin-add-method': authShot({ fixedHeight: null, temporaryState: [mfaTenant] }, showMethods),
  'authenticate-mfa-admin-one-method': authShot({ fixedHeight: null, temporaryState: [mfaTenant, emailMethod] }, showMethods),
  'authenticate-mfa-code-sent': authShot({ signedOut: true, keepAlerts: true, temporaryState: [mfaTenant, smsMethod] }, signIn),
  'authenticate-mfa-challenge-methods': authShot({ signedOut: true, temporaryState: [mfaTenant, emailAndAuthenticator] }, signIn),
  'authenticate-mfa-admin-two-methods': authShot({ fixedHeight: null, temporaryState: [mfaTenant, emailAndAuthenticator] }, showMethods),
  'authenticate-mfa-admin-disable-method': authShot({ fixedHeight: null, temporaryState: [mfaTenant, emailAndAuthenticator] }, async (page, ctx, { box, mark }) => {
    await showMethods(page);
    await mark('data-row', 'authenticator', '#multi-factor tbody tr', 'Authenticator');
    await box('disable-authenticator', ["#multi-factor tr[data-row='authenticator'] td:last-child a, #multi-factor tr[data-row='authenticator'] td:last-child button"], 4);
  }),
  'authenticate-mfa-self-service-methods': authShot({ signedOut: true, temporaryState: [mfaTenant, emailAndAuthenticator] }, selfServiceMethods),
};
