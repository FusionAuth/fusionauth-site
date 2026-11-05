import { preparation } from '../../kit.mjs';
import { useDocsHost, keepFraming } from '../../get-started/_shared.mjs';

async function leftoversApplicationList(page, ctx) {
  await useDocsHost(page);
  await keepFraming(page, ctx);
  await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(tr => tr.textContent.includes('Tenant manager'));
    if (row?.querySelectorAll('td')[1]) row.querySelectorAll('td')[1].textContent = '00000000-0000-0000-0000-f70000000005';
  });
}

// FusionAuth creates the Tenant manager application with a new random id on each start
async function pinTenantManagerId(page) {
  const pinned = await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
    const cell = row?.querySelectorAll('td')[1];
    if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
    return !!cell;
  });
  if (!pinned) throw new Error('Tenant manager row not found');
}

export const shots = {
  'leftovers-application-list': { prepare: preparation({ beforeSizing: leftoversApplicationList }) },
  'application-list': { legacyVersion: true, prepare: preparation({ afterControls: pinTenantManagerId }) },
  'application-oauth': { legacyVersion: true },
  'application-scopes': { legacyVersion: true },
  'application-cleanspeak': { band: 'el-tab-list, #clean-speak-integration' },
  'application-identities': { legacyVersion: true },
  'application-jwt-disabled': { legacyVersion: true },
  'application-jwt-enabled': {
    switch: ['application_jwtConfiguration_enabled'],
    band: 'el-tab-list, #jwt > fieldset:first-child > legend, #application_jwtConfiguration_enabled-form-row, #jwt-settings-body > fieldset:first-child',
  },
  'application-jwt-refresh-token': { switch: ['application_jwtConfiguration_enabled'], band: "[data-section='refresh-token-settings']" },
  'application-mfa': { legacyVersion: true },
  'application-webauthn': { switch: ['application_webAuthnConfiguration_enabled'], legacyVersion: true },
  'application-registration-verify': { switch: ['application_verifyRegistration'], band: "el-tab-list, [data-section='registration-verification-settings']" },
  'application-registration-self-service': { select: { selfRegistrationType: 'Create' }, band: "[data-section='self-service-registration'], #registration-configuration" },
  'application-registration-self-service-basic': { select: { selfRegistrationType: 'Complete' }, band: "[data-section='self-service-registration'], #registration-configuration" },
  'application-registration-self-service-advanced': {
    switch: ['application_registrationConfiguration_type-advanced'],
    select: { selfRegistrationType: 'Complete' },
    band: "[data-section='self-service-registration'], #registration-configuration",
  },
  'application-registration-form-settings': { band: "[data-section='form-settings']" },
  'application-saml-disabled': { legacyVersion: true },
  'application-saml-enabled': { switch: ['application_samlv2Configuration_enabled'], fixedHeight: null, legacyVersion: true },
  'application-saml-authentication-request': { switch: ['application_samlv2Configuration_enabled'], band: "[data-section='authentication-request']" },
  'application-saml-authentication-response': { switch: ['application_samlv2Configuration_enabled'], band: "[data-section='authentication-response']" },
  'application-saml-logout-request': { switch: ['application_samlv2Configuration_enabled'], band: "[data-section='logout-request'], #samlv2-settings-body > .switch-group" },
  'application-saml-logout-response': { switch: ['application_samlv2Configuration_enabled'], band: "[data-section='logout-response']" },
  'application-saml-assertion-encryption': {
    switch: ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_assertionEncryptionConfiguration_enabled'],
    band: "[data-section='assertion-encryption']",
  },
  'application-security': { legacyVersion: true },
};
