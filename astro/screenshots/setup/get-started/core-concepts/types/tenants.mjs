import { preparation } from '../../../kit.mjs';

async function tickExampleWebhook(page) {
  const selected = await page.evaluate(() => {
    const box = [...document.querySelectorAll('#webhooks input[type=checkbox]')].find(i => !i.id.startsWith('tenant_eventConfiguration'));
    if (box && !box.checked) box.click();
    return !!box;
  });
  if (!selected) throw new Error('example webhook checkbox not found');
}

async function openConnectorPolicyDialog(page) {
  await page.locator('el-tab-list button[aria-controls="connectors"]').click();
  await page.locator('#add-connector-policy').click();
  await page.locator('.prime-dialog.open').waitFor();
}

export const shots = {
  'tenant-webhooks-settings': { fixedHeight: null, legacyVersion: true, prepare: preparation({ afterAccount: tickExampleWebhook }) },
  'tenant-list': { legacyVersion: true },
  'tenant-add': { legacyVersion: true },
  'tenant-general': { legacyVersion: true },
  'tenant-token-exchange': { band: "[data-section='token-exchange-settings']" },
  'tenant-connectors': { band: "el-tab-list, [data-section='connector-settings']" },
  'tenant-connector-add-policy': { prepare: preparation({ beforeUserTabs: openConnectorPolicyDialog }) },
  'tenant-identities': { switch: ['tenant_emailConfiguration_verifyEmail', 'tenant_phoneConfiguration_verifyPhoneNumber'], fixedHeight: null, legacyVersion: true },
  'tenant-identities-template-settings': { fixedHeight: 'Template settings', legacyVersion: true },
  'tenant-smtp-settings': { legacyVersion: true },
  'tenant-family-settings': { switch: ['tenant_familyConfiguration_enabled'], legacyVersion: true },
  'tenant-mfa-policy-settings': { band: "[data-section='policies']" },
  'tenant-mfa-authenticator-settings': { band: "[data-section='authenticator-settings']" },
  'tenant-mfa-email-settings': { switch: ['tenant_multiFactorConfiguration_email_enabled'], band: "[data-section='email-settings']" },
  'tenant-mfa-phone-settings': {
    switch: ['tenant_multiFactorConfiguration_sms_enabled', 'tenant_multiFactorConfiguration_voice_enabled'],
    band: "[data-section='phone-settings']",
  },
  'tenant-webauthn': { band: "el-tab-list, [data-section='webauthn-settings'], [id^='tenant_webAuthnConfiguration_relyingParty'], #tenant_webAuthnConfiguration_debug-form-row" },
  'tenant-webauthn-bootstrap-settings': { switch: ['tenant_webAuthnConfiguration_bootstrapWorkflow_enabled'], band: "[data-section='bootstrap-passkey-authentication']" },
  'tenant-webauthn-reauthentication-settings': { switch: ['tenant_webAuthnConfiguration_reauthenticationWorkflow_enabled'], band: "[data-section='passkey-re-authentication']" },
  'tenant-oauth': { band: "el-tab-list, [data-section='advanced-sso-settings']" },
  'tenant-jwt': { fixedHeight: 'JSON web token settings', legacyVersion: true },
  'tenant-password-failed-authentication-settings': { band: "el-tab-list, [data-section='failed-authentication-settings']" },
  'tenant-password-breach-detection-settings': {
    switch: ['tenant_passwordValidationRules_breachDetection_enabled'],
    band: "[data-section='breached-password-detection-settings']",
  },
  'tenant-password-settings': { band: "[data-section='password-settings']" },
  'tenant-password-cryptographic-hash-settings': { band: "[data-section='cryptographic-hash-settings']" },
  'tenant-scim-settings': { switch: ['tenant_scimServerConfiguration_enabled'], legacyVersion: true },
  'tenant-security-acl-captcha': { switch: ['tenant_captchaConfiguration_enabled'], fixedHeight: null, legacyVersion: true },
  'tenant-security-blocked-domains': { band: "[data-section='blocked-domains-settings']" },
  'tenant-security-client-risk-rate-limit': { switch: ['tenant_clientRiskConfiguration_enabled'], fixedHeight: 'Client risk configuration', legacyVersion: true },
  'tenant-advanced-external-identifier-durations': { fixedHeight: null, legacyVersion: true },
  'tenant-advanced-external-identifier-generation': { fixedHeight: 'External identifier generation', legacyVersion: true },
};
