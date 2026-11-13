import { preparation, apiRequest, defaultTenantId, piedPiperAppId, dineshId, gilfoyleId } from '../../kit.mjs';
import { fill } from '../../deploy/_shared.mjs';
import { maskReactor } from '../../concepts/plans-and-limits/licensing.mjs';

const detection = { switch: ['tenant_passwordValidationRules_breachDetection_enabled'], fixedHeight: 'Breached password detection settings' };
const breachedQuery = '_exists_:breachedPasswordStatus AND NOT (breachedPasswordStatus:None)';
const breachedUsers = [dineshId, gilfoyleId];
const setDetection = enabled => apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { passwordValidationRules: { breachDetection: { enabled, matchMode: 'High', onLogin: 'RecordOnly' } } } });

// fixture users all have the password "password", so a login with detection on flags them
const breachedState = {
  order: 91,
  apply: async page => {
    // the reactor reports detection as PENDING for a while after activation
    for (let i = 0; (await apiRequest('/api/reactor')).status?.breachedPasswordDetection !== 'ACTIVE'; i++) {
      if (i >= 120) throw new Error('breached password detection never became active');
      await page.waitForTimeout(1000);
    }
    await setDetection(true);
    for (const id of breachedUsers) {
      const { user } = await apiRequest(`/api/user/${id}`);
      await apiRequest('/api/login', 'POST', { loginId: user.email, password: 'password', applicationId: piedPiperAppId });
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
  'breached-password-regenerate-key': { fixedHeight: null, prepare: preparation({ beforeSizing: openRegenerate, afterFraming: maskReactor }) },
};
