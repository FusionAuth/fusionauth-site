import { preparation, projectRoot, defaultThemeId } from '../../kit.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const registrationExample = {
  currentFieldId: '5c1f8e2a-9b3d-4a6e-8f7c-2d1b0a9e8c71',
  futureFieldId: '7a2e9d4b-1c6f-4e8a-b3d5-6f0c9a8b7e62',
  formId: 'b4d6f8a1-3e5c-4b7d-9a2f-1c8e6d4b2a93',
  lambdaId: 'c8e1a3f5-7b9d-4c2e-a6f8-3d5b7e9a1c04',
  themeId: 'd2f4a6c8-1e3b-4d5f-b7a9-8c0e2f4a6b15',
  appId: 'e6a8c0e2-4f6b-4a8d-9c1e-5b7d9f1a3c26',
};

const registrationMessages = `# Theme messages for custom form
user.data.currentAuth=Who is your current auth provider?
user.data.futureAuth=Who is your future auth provider?
[invalid]user.data.futureAuth=You should really give FusionAuth a try.`;

const registrationApp = {
  order: 4,
  paths: [
    `/api/application/${registrationExample.appId}`, `/api/form/${registrationExample.formId}`, `/api/form/field/${registrationExample.currentFieldId}`,
    `/api/form/field/${registrationExample.futureFieldId}`, `/api/lambda/${registrationExample.lambdaId}`, `/api/theme/${registrationExample.themeId}`,
  ],
  create: async api => {
    const r = registrationExample;
    await api(`/api/form/field/${r.currentFieldId}`, 'POST', { field: { key: 'user.data.currentAuth', name: 'Current auth provider', control: 'text', type: 'string' } });
    await api(`/api/form/field/${r.futureFieldId}`, 'POST', { field: { key: 'user.data.futureAuth', name: 'Future auth provider', control: 'text', type: 'string' } });
    // the built-in Username and Password fields, which get new ids on each install, then the two above
    const { fields } = await api('/api/form/field');
    const builtIn = name => fields.find(f => f.name === name).id;
    await api(`/api/form/${r.formId}`, 'POST', { form: { name: 'Auth Registration', type: 'registration', steps: [
      { fields: [builtIn('Username'), builtIn('Password')] },
      { fields: [r.currentFieldId, r.futureFieldId] },
    ] } });
    const body = readFileSync(join(projectRoot, 'extractedcode/example-lambdas/lambdas/self-service-registration-validation/conditional-field.js'), 'utf-8');
    await api(`/api/lambda/${r.lambdaId}`, 'POST', { lambda: { name: 'Auth Registration validation', type: 'SelfServiceRegistrationValidation', engineType: 'GraalJS', body } });
    const { theme: source } = await api(`/api/theme/${defaultThemeId}`);
    await api(`/api/theme/${r.themeId}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Auth Registration' } });
    await api(`/api/theme/${r.themeId}`, 'PATCH', { theme: { defaultMessages: `${registrationMessages}\n\n${source.defaultMessages}` } });
    await api(`/api/application/${r.appId}`, 'POST', { application: {
      name: 'Auth Registration', themeId: r.themeId,
      oauthConfiguration: { authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code'] },
      registrationConfiguration: { enabled: true, type: 'advanced', formId: r.formId },
      lambdaConfiguration: { selfServiceRegistrationValidationId: r.lambdaId },
    } });
  },
};

async function boxMessages(page) {
  await page.locator('main [role=tab]', { hasText: 'Messages' }).first().click();
  await page.waitForTimeout(800);
  await page.locator('#messages a[href*="isDefault=true"]').click();
  await page.locator('.prime-dialog.open .CodeMirror').waitFor();
  await page.waitForTimeout(1000);
  const tagged = await page.evaluate(count => {
    const lines = [...document.querySelectorAll('.prime-dialog.open .CodeMirror-code > div')].slice(0, count);
    if (lines.length !== count) return false;
    const first = lines[0].getBoundingClientRect(), last = lines.at(-1).getBoundingClientRect();
    const box = document.createElement('div');
    box.dataset.hl = 'registration-messages';
    box.style.cssText = `position:fixed;left:${first.left}px;top:${first.top}px;width:${first.width}px;height:${last.bottom - first.top}px;pointer-events:none`;
    document.body.append(box);
    return true;
  }, registrationMessages.split('\n').length);
  if (!tagged) throw new Error('registration message lines not found');
}

// the registration form's second step
async function completeFirstStep(page, ctx, { url }) {
  const deadline = Date.now() + 120_000;
  while (!await page.locator('#user_username').isVisible() || !await page.locator('#user_password').isVisible()) {
    if (Date.now() >= deadline) throw new Error('Registration form did not become ready');
    await page.waitForTimeout(500);
    await page.goto(url, { waitUntil: 'networkidle' });
  }
  // FusionAuth picks up the new theme's messages after a delay, so start over until the labels show
  for (let i = 0; ; i++) {
    await page.fill('#user_username', 'richard.h');
    await page.fill('#user_password', 'password-123456');
    await page.locator('form button[type=submit], form button').last().click();
    await page.waitForLoadState('networkidle');
    await page.locator('#user_data_currentAuth').waitFor();
    if (await page.getByText('Who is your current auth provider?').isVisible()) break;
    if (i === 30) throw new Error('registration theme messages not applied');
    await page.waitForTimeout(1000);
    await page.goto(url, { waitUntil: 'networkidle' });
  }
}

// the second step after the lambda rejects it
async function submitInvalidSecondStep(page, ctx, info) {
  await completeFirstStep(page, ctx, info);
  await page.fill('#user_data_currentAuth', 'BadAuth');
  await page.fill('#user_data_futureAuth', 'AuthTwo');
  await page.locator('form button[type=submit], form button').last().click();
  await page.waitForLoadState('networkidle');
}

export const shots = {
  'lambda-registration-form': { band: 'main h1, main form', temporaryResources: [registrationApp] },
  'lambda-registration-messages': { fixedHeight: null, prepare: preparation({ afterSystemTab: boxMessages }), temporaryResources: [registrationApp] },
  'lambda-registration-blank': { signedOut: true, prepare: preparation({ afterSignOut: completeFirstStep }), temporaryResources: [registrationApp] },
  'lambda-registration-invalid': { signedOut: true, prepare: preparation({ afterSignOut: submitInvalidSecondStep }), temporaryResources: [registrationApp] },
};
