import { preparation, apiRequest, defaultTenantId, piedPiperAppId, dineshId, gilfoyleId, fixedId } from '../../kit.mjs';
import { fill } from '../../deploy/_shared.mjs';
import { maskReactor } from '../../concepts/plans-and-limits/licensing.mjs';

const detection = { switch: ['tenant_passwordValidationRules_breachDetection_enabled'], fixedHeight: 'Breached password detection settings' };
const breachedQuery = '_exists_:breachedPasswordStatus AND NOT (breachedPasswordStatus:None)';
const breachedUsers = [dineshId, gilfoyleId];
const erlichId = '00000000-0000-0000-0000-100000000003';
const signupAppId = fixedId('f8', 1);
const setDetection = (enabled, onLogin = 'RecordOnly') => apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { passwordValidationRules: { breachDetection: { enabled, matchMode: 'High', onLogin } } } });

// the reactor reports detection as PENDING for a while after activation
async function waitForDetection(page) {
  for (let i = 0; (await apiRequest('/api/reactor')).status?.breachedPasswordDetection !== 'ACTIVE'; i++) {
    if (i >= 120) throw new Error('breached password detection never became active');
    await page.waitForTimeout(1000);
  }
}

// a real check only runs once per user for a while, so fall back to the result a login with "password" records
const breachedState = {
  order: 91,
  apply: async page => {
    await waitForDetection(page);
    await setDetection(true);
    // real checks feed the overview counts, so try a login before setting the status
    for (const id of breachedUsers) {
      const { user } = await apiRequest(`/api/user/${id}`);
      await apiRequest('/api/login', 'POST', { loginId: user.email, password: 'password', applicationId: piedPiperAppId });
      if ((await apiRequest(`/api/user/${id}`)).user.breachedPasswordStatus !== 'CommonPassword') await apiRequest(`/api/user/${id}`, 'PATCH', { user: { breachedPasswordStatus: 'CommonPassword' } });
    }
    for (let i = 0; (await apiRequest(`/api/user/search?queryString=${encodeURIComponent(breachedQuery)}`)).total < breachedUsers.length; i++) {
      if (i >= 60) throw new Error('breached users not found in search');
      await page.waitForTimeout(1000);
    }
    return async () => {
      // null drops the status, as on a user never checked
      for (const id of breachedUsers) await apiRequest(`/api/user/${id}`, 'PATCH', { user: { breachedPasswordStatus: null } });
      await setDetection(false);
    };
  },
};

const requireChangeState = {
  order: 92,
  apply: async page => {
    await waitForDetection(page);
    await setDetection(true, 'RequireChange');
    // a login check can come back clean, so set what a breached login records
    await apiRequest(`/api/user/${erlichId}`, 'PATCH', { user: { breachedPasswordStatus: 'CommonPassword', passwordChangeRequired: true, passwordChangeReason: 'Breached' } });
    return async () => {
      await apiRequest(`/api/user/${erlichId}`, 'PATCH', { user: { breachedPasswordStatus: null, passwordChangeRequired: false } });
      await setDetection(false);
    };
  },
};

const signupApp = {
  order: 42,
  paths: [`/api/application/${signupAppId}`],
  create: api => api(`/api/application/${signupAppId}`, 'POST', { application: {
    name: 'Pied Piper Signup',
    oauthConfiguration: { authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code'] },
    registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email', confirmPassword: true },
  } }),
};

async function submitPassword(page) {
  await page.selectOption('#editPasswordOption', 'update');
  await page.fill('#user_password', 'password');
  await page.fill('#confirm_user_password', 'password');
  await page.locator('main button[type=submit], header button[type=submit]').first().click();
  await page.locator('#user_password-form-row .error').first().waitFor();
}

async function openUserMenu(page) {
  await page.locator('header el-dropdown button').click();
  await page.locator('#require-password-change').waitFor({ state: 'visible' });
  await page.locator('#require-password-change').evaluate(el => el.setAttribute('data-hl', 'require-password-change'));
}

async function register(page) {
  await page.fill('#email', 'jared@piedpiper.com');
  await page.fill('#password', 'password');
  await page.fill('#passwordConfirm', 'password');
  await page.press('#passwordConfirm', 'Enter');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.activeElement?.blur());
}

// shortly after license activation the dialog asks you to wait a few minutes instead
async function openRegenerate(page) {
  for (let i = 0; ; i++) {
    await page.getByRole('button', { name: /Actions/ }).click();
    await page.getByText('Regenerate encryption key').click();
    await page.locator('.prime-dialog.open').waitFor();
    await page.waitForTimeout(500);
    if (await page.locator('.prime-dialog.open').getByRole('button', { name: 'Confirm' }).count()) return;
    if (i >= 10) throw new Error('regenerate encryption key dialog never offered Confirm');
    await page.waitForTimeout(30000);
    await page.reload({ waitUntil: 'networkidle' });
  }
}

export const shots = {
  'operate-turn-on-detection': { ...detection },
  'operate-breached-password-configuration-options': {
    ...detection,
    sectionBox: 'breached-password-detection-settings',
    prepare: preparation({ beforeSizing: page => fill(page, 'tenant_passwordValidationRules_breachDetection_onLogin', 'RequireChange') }),
  },
  'breached-password-overview-report': { temporaryState: [breachedState], prepare: preparation({ afterFraming: maskReactor }) },
  'breached-password-user-report': { temporaryState: [breachedState], fixedHeight: null },
  'breached-password-admin-error': { temporaryState: [breachedState], fixedHeight: null, prepare: preparation({ beforeSizing: submitPassword }) },
  'breached-password-user-actions': {
    temporaryState: [breachedState],
    fixedHeight: null,
    keepAlerts: true,
    prepare: preparation({ beforeSizing: (page, ctx, { freezeMenu }) => openUserMenu(page).then(() => freezeMenu('el-menu:has(#require-password-change)')) }),
  },
  'breached-password-registration': {
    temporaryState: [breachedState],
    temporaryResources: [signupApp],
    signedOut: true,
    prepare: preparation({ afterSignOut: register }),
  },
  'breached-password-login': {
    temporaryState: [requireChangeState],
    signedOut: true,
    keepAlerts: true,
    prepare: preparation({ afterSignOut: (page, ctx, { hostedLogin }) => hostedLogin('erlich@bachmanity.com') }),
  },
  'breached-password-regenerate-key': { fixedHeight: null, prepare: preparation({ beforeSizing: openRegenerate, afterFraming: maskReactor }) },
};
