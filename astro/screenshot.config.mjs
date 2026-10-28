import { createHmac, generateKeyPairSync } from 'crypto';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// load .env from this directory for local development (no-op if file absent)
try {
  const envFile = join(dirname(fileURLToPath(import.meta.url)), '.env');
  readFileSync(envFile, 'utf-8').split('\n').forEach(line => {
    const m = line.match(/^([^#=\s][^=]*)=(.*)/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  });
} catch {}

let adminLocale;
// the OAuth single sign-on cookie, set aside while a screenshot needs a signed-out hosted page
let savedSso;
const signedOut = ['lambda-registration-blank', 'lambda-registration-invalid', 'five-minute-login', 'migration-user-login', 'authenticate-mfa-code-sent', 'authenticate-mfa-challenge-methods', 'authenticate-mfa-self-service-methods', 'authenticate-account-lock-user-view', 'manage-user-actions-locked-account', 'manage-verification-email-gate-link', 'manage-verification-email-gate-code', 'manage-verification-phone-gate', 'manage-verification-registration-gate-link', 'manage-verification-registration-gate-code'];


const dineshId = '00000000-0000-0000-0000-100000000004';
const gilfoyleId = '00000000-0000-0000-0000-100000000005';
const monicaId = '00000000-0000-0000-0000-100000000006';
const gavinId = '00000000-0000-0000-0000-100000000007';
const familyId = '00000000-0000-0000-0000-800000000001';
const printersTypeId = '00000000-0000-0000-0000-a00000000001';

// the tab bar is set up by a module script after the page loads
const tabsReady = page => page.waitForFunction(() => customElements.get('el-tab-group') && customElements.get('el-tab-list'), null, { timeout: 10000 });

// scroll the tab bar so it starts on a whole tab and still shows the selected one
const alignTabBar = page => page.evaluate(() => {
  const btn = document.querySelector('el-tab-list button[aria-selected="true"]');
  const bar = btn?.closest('.tab-list-container');
  if (!bar) return;
  const x = el => el.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
  const end = x(btn) + btn.offsetWidth;
  bar.scrollLeft = end <= bar.clientWidth ? 0
    : [...bar.querySelectorAll('el-tab-list button')].map(x).find(left => left >= end - bar.clientWidth);
});

// click until the tab's panel shows
async function selectTab(page, label) {
  await tabsReady(page);
  for (let i = 0; i < 20; i++) {
    const selected = await page.evaluate(l => {
      const btn = [...document.querySelectorAll('el-tab-list button')].find(b => b.textContent.trim() === l);
      const shown = () => btn?.getAttribute('aria-selected') === 'true' && !document.getElementById(btn.getAttribute('aria-controls'))?.hidden;
      if (btn && !shown()) btn.click();
      return shown();
    }, label);
    if (selected) return alignTabBar(page);
    await page.waitForTimeout(250);
  }
  throw new Error(`tab "${label}" was not selected`);
}

// switched on (not saved) so the screenshot shows the settings each one reveals
const switches = {
  'theme-kickstart-app-oauth': ['application_oauthConfiguration_requireRegistration'],
  'tenant-identities': ['tenant_emailConfiguration_verifyEmail', 'tenant_phoneConfiguration_verifyPhoneNumber'],
  'tenant-family-settings': ['tenant_familyConfiguration_enabled'],
  'tenant-mfa-email-settings': ['tenant_multiFactorConfiguration_email_enabled'],
  'tenant-mfa-phone-settings': ['tenant_multiFactorConfiguration_sms_enabled', 'tenant_multiFactorConfiguration_voice_enabled'],
  'tenant-webauthn-bootstrap-settings': ['tenant_webAuthnConfiguration_bootstrapWorkflow_enabled'],
  'tenant-webauthn-reauthentication-settings': ['tenant_webAuthnConfiguration_reauthenticationWorkflow_enabled'],
  'tenant-password-breach-detection-settings': ['tenant_passwordValidationRules_breachDetection_enabled'],
  'tenant-scim-settings': ['tenant_scimServerConfiguration_enabled'],
  'tenant-security-acl-captcha': ['tenant_captchaConfiguration_enabled'],
  'tenant-security-client-risk-rate-limit': ['tenant_clientRiskConfiguration_enabled'],
  'application-jwt-enabled': ['application_jwtConfiguration_enabled'],
  'application-jwt-refresh-token': ['application_jwtConfiguration_enabled'],
  'application-registration-verify': ['application_verifyRegistration'],
  'application-webauthn': ['application_webAuthnConfiguration_enabled'],
  'application-registration-self-service-advanced': ['application_registrationConfiguration_type-advanced'],
  'application-saml-enabled': ['application_samlv2Configuration_enabled'],
  'application-saml-authentication-request': ['application_samlv2Configuration_enabled'],
  'application-saml-authentication-response': ['application_samlv2Configuration_enabled'],
  'application-saml-logout-request': ['application_samlv2Configuration_enabled'],
  'application-saml-logout-response': ['application_samlv2Configuration_enabled'],
  'entity-type-add-jwt-tab': ['entityType_jwtConfiguration_enabled'],
  'application-saml-assertion-encryption': ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_assertionEncryptionConfiguration_enabled'],
  'webhook-tenants': ['webhook_global'],
  'webhook-signature': ['webhook_signatureConfiguration_enabled'],
  'webhook-event-log-settings': ['systemConfiguration_webhookEventLogConfiguration_enabled'],
  'kafka': ['integrations_kafka_enabled'],
  'lambda-edit-application': ['application_jwtConfiguration_enabled'],
  'multi-tenant-key-manager': ['apiKey_keyManager'],
  'migration-rehash-on-login': ['tenant_passwordEncryptionConfiguration_modifyEncryptionSchemeOnLogin'],
  'scim-sdk-tenant-settings': ['tenant_scimServerConfiguration_enabled'],
  'idp-azure-oidc-edit': ['useOpenIdDiscovery'],
  'idp-cognito-edit': ['useOpenIdDiscovery'],
  'idp-okta-oidc-edit': ['useOpenIdDiscovery'],
  'idp-oidc-add': ['useOpenIdDiscovery'],
  'idp-hypr-add': ['identityProvider_applicationConfiguration[00000000-0000-0000-0000-f20000000001]_enabled'],
  'idp-samlv2-add-options': ['identityProvider_loginHintConfiguration_enabled'],
  'idp-cors-settings': ['systemConfiguration_corsConfiguration_enabled', 'systemConfiguration_corsConfiguration_debug'],
  // Authenticate users.
  'authenticate-tenant-oauth-access-token-bootstrap': ['tenant_ssoConfiguration_allowAccessTokenBootstrap'],
  'authenticate-tenant-mfa-methods': ['tenant_multiFactorConfiguration_email_enabled', 'tenant_multiFactorConfiguration_sms_enabled', 'tenant_multiFactorConfiguration_voice_enabled'],
  'authenticate-tenant-security-client-risk-signals': ['tenant_clientRiskConfiguration_enabled'],
  'authenticate-application-oauth-refresh-grant': ['application_oauthConfiguration_generateRefreshTokens'],
  'authenticate-application-security-login-api-refresh': ['application_loginConfiguration_generateRefreshTokens', 'application_loginConfiguration_allowTokenRefresh'],
  'authenticate-application-saml-enabled': ['application_samlv2Configuration_enabled'],
  'authenticate-application-saml-authentication': ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_requireSignedRequests', 'application_samlv2Configuration_initiatedLogin_enabled'],
  'authenticate-application-saml-logout': ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_logout_requireSignedRequests', 'application_samlv2Configuration_logout_singleLogout_enabled'],
  'authenticate-application-saml-encryption': ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_assertionEncryptionConfiguration_enabled'],
  'authenticate-application-security-authentication-tokens': ['application_authenticationTokenConfiguration_enabled'],
  'authenticate-cockroachdb-application-jwt': ['application_jwtConfiguration_enabled'],
  'authenticate-tableau-cors': ['systemConfiguration_corsConfiguration_enabled'],
  'authenticate-tableau-application-jwt': ['application_jwtConfiguration_enabled'],
  'authenticate-zendesk-application-saml': ['application_samlv2Configuration_enabled'],
  'authenticate-tableau-cloud-cors': ['systemConfiguration_corsConfiguration_enabled'],
  'authenticate-tableau-cloud-application-saml': ['application_samlv2Configuration_enabled'],
  'authenticate-sendgrid-application-saml': ['application_samlv2Configuration_enabled'],
};

// chosen (not saved) before the switches above
const selects = {
  'application-registration-self-service': { selfRegistrationType: 'Create' },
  'application-registration-self-service-basic': { selfRegistrationType: 'Complete' },
  'application-registration-self-service-advanced': { selfRegistrationType: 'Complete' },
  'multi-tenant-control-plane-registration': { selfRegistrationType: 'Create' },
  'account-application-self-service-form': { application_formConfiguration_selfServiceFormId: '' },
  // Authenticate users.
  'authenticate-tenant-oauth-session-timeout': { tenant_httpSessionMaxInactiveInterval: '60' },
  'authenticate-account-lock-tenant-settings': {
    tenant_failedAuthenticationConfiguration_userActionId: '00000000-0000-0000-0000-f30000000001', tenant_failedAuthenticationConfiguration_tooManyAttempts: '5',
    tenant_failedAuthenticationConfiguration_resetCountInSeconds: '60', tenant_failedAuthenticationConfiguration_actionDuration: '3', tenant_failedAuthenticationConfiguration_actionDurationUnit: 'MINUTES',
  },
  'authenticate-tenant-mfa-methods': { tenant_multiFactorConfiguration_voice_messengerId: '00000000-0000-0000-0000-f30000000012', tenant_multiFactorConfiguration_voice_templateId: '00000000-0000-0000-0000-f30000000014' },
  'authenticate-application-oauth-logout-behavior': { application_oauthConfiguration_logoutBehavior: 'RedirectOnly' },
  'authenticate-application-add-pied-piper-oauth': { application_name: 'Pied Piper', application_oauthConfiguration_logoutURL: 'http://piedpiper.local:3000/endsession' },
  'authenticate-cockroachdb-tenant-issuer': { tenant_issuer: 'https://your.fusionauth.app.domain' },
  'authenticate-cockroachdb-application-jwt': { application_name: 'CockroachDB' },
  'authenticate-tableau-application-add': { application_name: 'Tableau Cloud OIDC' },
  'authenticate-tableau-application-oauth': { application_name: 'Tableau Cloud OIDC' },
  'authenticate-tableau-application-jwt': { application_name: 'Tableau Cloud OIDC' },
  'authenticate-salesforce-application-add': { application_name: 'Salesforce' },
  'authenticate-zendesk-application-roles': { application_name: 'Zendesk' },
  'authenticate-zendesk-application-saml': {
    application_name: 'Zendesk', application_samlv2Configuration_issuer: 'https://fusionauth-example.zendesk.com',
    application_samlv2Configuration_logoutURL: 'https://piedpiper.com', application_lambdaConfiguration_samlv2PopulateId: '00000000-0000-0000-0000-f3000000000c',
  },
  'authenticate-tableau-cloud-application-add': { application_name: 'Tableau' },
  'authenticate-tableau-cloud-application-saml': { application_name: 'Tableau', application_samlv2Configuration_issuer: 'https://placeholder.example.com' },
  'authenticate-sendgrid-application-saml': { application_name: 'SendGrid' },
};

// pages too long to show in full keep the screenshot's height, scrolled to the named section if there is one
const fixedHeight = {
  'tenant-identities': null,
  'tenant-identities-template-settings': 'Template settings',
  'tenant-jwt': 'JSON web token settings',
  'tenant-webhooks-settings': null,
  'tenant-security-acl-captcha': null,
  'tenant-security-client-risk-rate-limit': 'Client risk configuration',
  'tenant-advanced-external-identifier-durations': null,
  'tenant-advanced-external-identifier-generation': 'External identifier generation',
  'application-saml-enabled': null,
  'theme-apply-tenant': null,
  'theme-apply-application': null,
  'theme-add-advanced': null,
  'theme-preview-oauth-authorize': null,
  'theme-preview-oauth-logout': null,
  'theme-dark-messages': null,
  'theme-simple-editor-messages': null,
  'theme-create-api-key': "[data-hl='api-theme-row']",
  'webhook-add': null,
  'webhook-test': null,
  'lambda-registration-messages': null,
  'lambda-edit-application': 'Lambda settings',
  'multi-tenant-key-manager': null,
  'five-minute-dashboard': null,
  'five-minute-application-details': null,
  'multi-tenant-blueprint-tenant': null,
  'segment-add-user': null,
  'account-application-self-service-form': null,
  'account-application-details': null,
  'account-theme-templates': null,
  'account-tenant-webauthn': null,
  'account-tenant-mfa-email': null,
  'account-tenant-mfa-phone': null,
  'idp-add-menu-openid-connect': null,
  'idp-add-menu-samlv2': null,
  'idp-add-menu-twitter': null,
  'idp-cors-warning-okta': null,
  'idp-cors-warning-samlv2': null,
  'idp-cors-warning-apple': null,
  'idp-list-samlv2-view': null,
  'idp-list-saml-idp-initiated-view': null,
  'idp-view-adfs': null,
  'idp-view-azure-saml': null,
  'idp-view-okta-saml': null,
  'idp-view-samlv2': null,
  'idp-view-saml-idp-initiated': null,
  'idp-adfs-edit': null,
  'idp-azure-oidc-edit': null,
  'idp-azure-saml-edit': '[data-idp-scroll]',
  'idp-cognito-edit': null,
  'idp-okta-oidc-edit': null,
  'idp-okta-idp-initiated-edit': null,
  'idp-okta-saml-claims': '[data-idp-scroll]',
  'idp-okta-saml-settings': '[data-idp-scroll]',
  'idp-samlv2-idp-initiated-add': null,
  'idp-external-jwt-claim-dialog': null,
  'idp-external-jwt-domains': '[data-idp-scroll]',
  'idp-external-jwt-jwt': '[data-idp-scroll]',
  'idp-external-jwt-oauth': '[data-idp-scroll]',
  'idp-discord-edit': null,
  'idp-oidc-add': null,
  'idp-samlv2-add-options': '[data-idp-scroll]',
  'idp-key-import-menu': null,
  'idp-key-import-certificate': null,
  'idp-key-import-adfs': null,
  'idp-key-import-okta': null,
  'idp-apple-import-key': null,
  'idp-app-oauth': '[data-idp-scroll]',
  'idp-app-login-url': null,
  // Authenticate users.
  'authenticate-tenant-oauth-session-timeout': null,
  'authenticate-tenant-jwt': 'JSON web token settings',
  'authenticate-tenant-oauth-access-token-bootstrap': null,
  'authenticate-account-lock-user-action': null,
  'authenticate-account-lock-tenant-settings': null,
  'authenticate-account-lock-admin-view': null,
  'authenticate-tenant-mfa-methods': 'Authenticator settings',
  'authenticate-mfa-admin-add-method': null,
  'authenticate-mfa-admin-one-method': null,
  'authenticate-mfa-admin-two-methods': null,
  'authenticate-mfa-admin-disable-method': null,
  'authenticate-application-oauth-refresh-grant': '#application_oauthConfiguration_clientAuthenticationPolicy-form-row',
  'authenticate-application-saml-enabled': null,
  'authenticate-application-saml-authentication': 'Authentication request',
  'authenticate-application-saml-logout': 'Logout request',
  'authenticate-application-saml-encryption': 'Assertion encryption',
  'authenticate-application-add-pied-piper-oauth': '#application_oauthConfiguration_clientId-form-row',
  'authenticate-user-registrations-sso': null,
  'authenticate-application-security-authentication-tokens': 'Login API settings',
  'authenticate-entity-add-email-api': null,
  'authenticate-cockroachdb-tenant-issuer': null,
  'authenticate-cockroachdb-application-jwt': null,
  'authenticate-tableau-cors': 'Cross-origin requests',
  'authenticate-tableau-application-add': null,
  'authenticate-tableau-application-oauth': '#application_oauthConfiguration_authorizedURLValidationPolicy-form-row',
  'authenticate-tableau-application-jwt': null,
  'authenticate-salesforce-application-add': null,
  'authenticate-salesforce-application-oauth': '#application_oauthConfiguration_clientId-form-row',
  'authenticate-aiven-api-key-add': "[data-scroll='api-key-endpoints']",
  'authenticate-aiven-user-add': null,
  'authenticate-aiven-user-registrations': null,
  'authenticate-zendesk-application-roles': null,
  'authenticate-zendesk-lambda-add': null,
  'authenticate-tableau-cloud-cors': 'Cross-origin requests',
  'authenticate-tableau-cloud-application-add': null,
  'authenticate-tableau-cloud-application-saml': null,
  'authenticate-sendgrid-application-saml': null,
  'authenticate-tableau-key-generate-menu': null,
  'authenticate-tableau-key-generate-dialog': null,
  'authenticate-application-saml-view-dialog': null,
  'authenticate-tableau-cloud-metadata-url': null,
  'authenticate-sendgrid-saml-details': null,
  'authenticate-zendesk-key-fingerprint': null,
  'authenticate-tableau-application-details': null,
  'authenticate-application-view-client-credentials': null,
  'authenticate-aiven-api-keys': null,
  'authenticate-sendgrid-metadata': null,
  // Manage users and verification
  'manage-verification-tenant-email-settings': 'Messaging settings',
  'manage-verification-email-template-right': 'Messaging settings',
  'manage-verification-email-template-wrong': 'Messaging settings',
  'manage-pre-verification-tenant-email': 'Messaging settings',
  'manage-pre-verification-tenant-phone': 'Messaging settings',
  'manage-verification-application-registration-delete': 'Registration verification settings',
  'manage-verification-tenant-phone-timeout': 'External identifier durations',
  'manage-verification-tenant-email-timeouts': 'External identifier durations',
  'manage-verification-email-template': null,
  'manage-verification-application-details': null,
  'manage-verification-email-gate-link': null,
  'manage-verification-email-gate-code': null,
  'manage-verification-registration-gate-link': null,
  'manage-verification-registration-gate-code': null,
  'manage-verification-tenant-messenger': null,
  'manage-verification-tenant-phone-settings': null,
  'manage-verification-phone-template': null,
  'manage-verification-application-registration-settings': null,
  'manage-verification-registration-template': null,
  'manage-verification-registration-template-right': null,
  'manage-verification-registration-template-wrong': null,
  'manage-pre-verification-field-email': null,
  'manage-pre-verification-field-phone': null,
  'manage-pre-verification-form-email': null,
  'manage-pre-verification-form-phone': null,
  'manage-pre-verification-application-email-form': null,
  'manage-pre-verification-application-phone-form': null,
  'manage-pre-verification-application-details': null,
  'manage-pre-verification-user-email-verified': null,
  'manage-pre-verification-user-phone-verified': null,
  'manage-pre-verification-user-email-phone-verified': null,
  'manage-pre-verification-twilio-messenger': null,
  'manage-user-actions-tenant-smtp': null,
  'manage-user-actions-application-add': null,
  'manage-user-actions-application-oauth': null,
  'manage-user-actions-api-key': null,
  'manage-user-actions-welcome-template': null,
  'manage-user-actions-reasons-button': null,
  'manage-user-actions-reasons': null,
  'manage-user-actions-webhook-add': null,
  'manage-user-actions-subscribe-action': null,
  'manage-user-actions-survey-action': null,
  'manage-user-actions-locked-account': null,
  'manage-admin-forms-user-form': null,
  'manage-admin-forms-registration-form': null,
  'manage-cleanspeak-integration': null,
  // Register users and user support.
  'register-built-out-advanced-form': null,
  'register-basic-registration': '.tab-list-container',
  'register-minimum-price-form-field': null,
  'register-geographic-area-form-field': null,
  'register-new-form': null,
  'register-first-step-form-editor': null,
  'register-second-step-form-editor': null,
  'register-find-registration-url': null,
  'register-first-step-no-placeholder': null,
  'register-new-user-data-display': null,
  'register-update-theme-for-tenant': null,
  'register-first-step-with-placeholder': null,
  'register-first-step-with-placeholder-and-labels': null,
  'register-add-custom-field': null,
  'register-add-admin-user-form': null,
  'register-add-admin-registration-form': null,
  'register-associate-admin-user-form': null,
  'register-associate-admin-registration-form': null,
  'register-set-user-role-user-manager': null,
  'register-limited-menu': null,
  'register-user-edit-screen': null,
  'register-registration-edit-screen': null,
  'register-setup-locale-selection': null,
  'register-hidden-field': null,
  'register-register-new-user': null,
  'register-login-page': null,
  'register-complete-registration-settings': '.tab-list-container',
  'register-basic-registration-settings': '.tab-list-container',
  'register-registration-url': null,
  'register-new-user-listing': null,
  'register-users-tab': null,
  'register-new-user-form': null,
  'register-require-password-change': null,
  'register-confirm-change': null,
  'register-verify': null,
  'register-edit-user': null,
  'register-sessions': null,
  'register-lock-account': null,
  'register-confirm-lock': null,
  'register-unlock-account': null,
  'register-confirm-unlock': null,
  'register-add-registration': null,
  'register-select-application': null,
  'register-roles': null,
  'register-add-comment': null,
  'register-write-comment': null,
  'register-remove-user-action': null,
  'register-confirm-action-cancellation': null,
};

const defaultThemeId = '75a068fd-e94b-451a-9aeb-3ddb9a3b5987';
const simpleThemeId = '3c717291-5d83-4014-bd51-97c76475dc86';
const piedPiperThemeId = '6e1f7a52-3c4d-4b8a-9f0e-2d7c1b9a8e31';
const darkThemeId = '9c2d4e6f-8a1b-4c3d-9e5f-7a6b5c4d3e21';

// simple theme editor panel opened for each screenshot
const simpleEditorTabs = {
  'theme-simple-editor-images': 'Images',
  'theme-simple-editor-styles': 'Styles',
  'theme-simple-editor-messages': 'Messages',
  'theme-simple-editor-preview': 'Pages preview',
};

// theme chosen (not saved) in the Theme select
const themeSelects = {
  'theme-apply-tenant': piedPiperThemeId,
  'theme-apply-application': piedPiperThemeId,
};

// full-width strips of the window around these parts of the page, so the sidebar stays beside them
const bands = {
  'tenant-connectors': "el-tab-list, [data-section='connector-settings']",
  'tenant-mfa-policy-settings': "[data-section='policies']",
  'tenant-mfa-authenticator-settings': "[data-section='authenticator-settings']",
  'tenant-mfa-email-settings': "[data-section='email-settings']",
  'tenant-mfa-phone-settings': "[data-section='phone-settings']",
  'tenant-webauthn': "el-tab-list, [data-section='webauthn-settings'], [id^='tenant_webAuthnConfiguration_relyingParty'], #tenant_webAuthnConfiguration_debug-form-row",
  'tenant-webauthn-bootstrap-settings': "[data-section='bootstrap-passkey-authentication']",
  'tenant-webauthn-reauthentication-settings': "[data-section='passkey-re-authentication']",
  'tenant-oauth': "el-tab-list, [data-section='advanced-sso-settings']",
  'tenant-password-failed-authentication-settings': "el-tab-list, [data-section='failed-authentication-settings']",
  'tenant-password-breach-detection-settings': "[data-section='breached-password-detection-settings']",
  'tenant-password-settings': "[data-section='password-settings']",
  'tenant-password-cryptographic-hash-settings': "[data-section='cryptographic-hash-settings']",
  'tenant-security-blocked-domains': "[data-section='blocked-domains-settings']",
  'application-cleanspeak': "el-tab-list, #clean-speak-integration",
  'application-jwt-enabled': "el-tab-list, #jwt > fieldset:first-child > legend, #application_jwtConfiguration_enabled-form-row, #jwt-settings-body > fieldset:first-child",
  'application-jwt-refresh-token': "[data-section='refresh-token-settings']",
  'application-registration-verify': "el-tab-list, [data-section='registration-verification-settings']",
  'application-registration-self-service': "[data-section='self-service-registration'], #registration-configuration",
  'application-registration-self-service-basic': "[data-section='self-service-registration'], #registration-configuration",
  'application-registration-self-service-advanced': "[data-section='self-service-registration'], #registration-configuration",
  'application-registration-form-settings': "[data-section='form-settings']",
  'application-saml-authentication-request': "[data-section='authentication-request']",
  'application-saml-authentication-response': "[data-section='authentication-response']",
  'application-saml-logout-request': "[data-section='logout-request'], #samlv2-settings-body > .switch-group",
  'application-saml-logout-response': "[data-section='logout-response']",
  'application-saml-assertion-encryption': "[data-section='assertion-encryption']",
  'webhook-security': 'el-tab-list, #security',
  'webhook-tenants': 'el-tab-list, #tenants',
  'webhook-tenants-selection': 'el-tab-list, #tenants',
  'webhook-headers': 'el-tab-list, #headers',
  'lambda-registration-form': 'main h1, main form',
  'migration-rehash-on-login': "[data-section='cryptographic-hash-settings']",
  'migration-tenant-connector-policies': "el-tab-list, [data-section='connector-settings']",
  'migration-generic-connector-security': 'el-tab-list, #security',
  'migration-generic-connector-headers': 'el-tab-list, #headers',
  'migration-ldap-connector-directory': 'el-tab-list, #directory-configuration',
  'idp-azure-oidc-applications': 'el-tab-list, #applications',
  'idp-azure-saml-options': 'el-tab-list, #options',
  'idp-azure-saml-applications': 'el-tab-list, #applications',
  'idp-okta-idp-initiated-options': 'el-tab-list, #options',
  'idp-samlv2-idp-initiated-add-options': 'el-tab-list, #options',
  'idp-discord-applications': 'el-tab-list, #applications',
  'idp-discord-options': 'el-tab-list, #options',
  'idp-nintendo-options': 'el-tab-list, #options',
  'idp-google-options': 'el-tab-list, #options',
  'idp-apple-overrides': 'el-tab-list, #applications',
  'idp-linking-strategy': "label[for='identityProvider_linkingStrategy'], [data-hl='idp-listbox']",
  'idp-oidc-add-applications': 'el-tab-list, #applications',
  'idp-oidc-add-domains': 'el-tab-list, #domains',
  'idp-oidc-add-options': 'el-tab-list, #options',
  'idp-samlv2-add-domains': 'el-tab-list, #managed-domains',
  // Authenticate users.
  'authenticate-tenant-security-client-risk-signals': "[data-section='client-risk-configuration']",
  'authenticate-application-security-login-api-refresh': "[data-section='login-api-settings']",
  'authenticate-application-oauth-logout-behavior': 'el-tab-list, #application_oauthConfiguration_logoutBehavior-form-row',
  'authenticate-zendesk-application-saml': 'el-tab-list, #application_lambdaConfiguration_samlv2PopulateId-form-row',
  // Manage users and verification
  'manage-verification-application-self-service': '#manage-self-service-strip',
  'manage-verification-application-self-service-phone': '#manage-self-service-strip',
  'manage-search-about-engine': "[data-hl='system-panel']",
};

const exampleWebhookId = '00000000-0000-0000-0000-600000000001';

const atestLambdaId = 'f3b3b547-7754-452d-8729-21b50d111505';
const atestBody = word => `function populate(jwt, user, registration) {\n  jwt.message = '${word} World!';\n  console.info('${word} World!');\n}`;
const registrationExample = {
  currentFieldId: '5c1f8e2a-9b3d-4a6e-8f7c-2d1b0a9e8c71',
  futureFieldId: '7a2e9d4b-1c6f-4e8a-b3d5-6f0c9a8b7e62',
  formId: 'b4d6f8a1-3e5c-4b7d-9a2f-1c8e6d4b2a93',
  lambdaId: 'c8e1a3f5-7b9d-4c2e-a6f8-3d5b7e9a1c04',
  themeId: 'd2f4a6c8-1e3b-4d5f-b7a9-8c0e2f4a6b15',
  appId: 'e6a8c0e2-4f6b-4a8d-9c1e-5b7d9f1a3c26',
};

const exampleAppId = 'f1a3c5e7-9b2d-4f6a-8c0e-3b5d7f9a1c37';
const blueprintTenantId = 'a7c9e1b3-5d2f-4a8c-9e6b-1f3a5c7e9d48';
const hierarchy = {
  types: { Company: 'b8d0f2a4-6e3c-4b9d-8f7a-2c4e6a8b0f59', Department: 'c9e1a3b5-7f4d-4c0e-9a8b-3d5f7b9c1a60', Document: 'd0f2b4c6-8a5e-4d1f-a9c0-4e6a8c0d2b71' },
  entities: {
    'Change Bank': ['Company', 'e1a3c5d7-9b6f-4e2a-b0d1-5f7b9d1e3c82'],
    'Change Insurance': ['Company', 'f2b4d6e8-0c7a-4f3b-81e2-6a8c0e2f4d93'],
    'Change Insurance Operations': ['Department', 'a3c5e7f9-1d8b-4a4c-92f3-7b9d1f3a5ea4'],
    'Change Bank Operations': ['Department', 'b4d6f8a0-2e9c-4b5d-a3a4-8c0e2a4b6fb5'],
    'Change Bank Finance': ['Department', 'c5e7a9b1-3f0d-4c6e-b4b5-9d1f3b5c7ac6'],
    Passwords: ['Document', 'e52925cb-1072-421f-9f64-a64aacd8a7cb'],
    Statements: ['Document', '832bf368-6adc-4ae0-b838-41feeb01ac47'],
  },
  // entity, the entity it is granted on, permissions
  grants: [
    ['Change Bank Operations', 'Change Bank', ['IsMember']],
    ['Change Bank Finance', 'Change Bank', ['IsMember']],
    ['Change Insurance Operations', 'Change Insurance', ['IsMember']],
    ['Passwords', 'Change Bank Operations', ['IsMember']],
    ['Statements', 'Change Bank Finance', ['IsMember']],
  ],
};

// migrate users section
const migration = {
  // matches the example tenant Id in the migration guides
  importTenantId: '25c9d123-8a79-4edd-9f76-8dd9c806b0f3',
  importAppId: '00000000-0000-0000-0000-f10000000001',
  importUsers: [
    ['00000000-0000-0000-0000-f10000000011', 'jared@example.com', 'Jared', 'Dunn'],
    ['00000000-0000-0000-0000-f10000000012', 'laurie@example.com', 'Laurie', 'Bream'],
  ],
  apiKeyId: '00000000-0000-0000-0000-f10000000021',
  connectorTenantId: '00000000-0000-0000-0000-f10000000031',
  ldapConnectorId: '00000000-0000-0000-0000-f10000000032',
  genericConnectorId: '00000000-0000-0000-0000-f10000000033',
  reconcileLambdaId: '00000000-0000-0000-0000-f10000000034',
  policyTenantId: '00000000-0000-0000-0000-f10000000035',
  googleIdpId: '82339786-3dff-42a6-aac6-1f1ceecb6c46',
  exampleUsers: [
    ['00000000-0000-0000-0000-f10000000061', 'janesmith@example.com', 'Jane', 'Smith'],
    ['00000000-0000-0000-0000-f10000000062', 'johndoe@example.com', 'John', 'Doe'],
  ],
  scim: {
    serverTypeId: '00000000-0000-0000-0000-f10000000071',
    clientTypeId: '00000000-0000-0000-0000-f10000000072',
    serverId: '00000000-0000-0000-0000-f10000000073',
    clientId: '00000000-0000-0000-0000-f10000000074',
    userId: '00000000-0000-0000-0000-f10000000075',
  },
  // the generic connector each guide sets up, and the tenant its policy goes on
  providers: {
    akamai: { name: 'AkamaiConnector', authenticationURL: 'http://app', timeout: 5000, debug: true },
    frontegg: { name: 'FronteggConnector', authenticationURL: 'http://host.docker.internal:6252', timeout: 3000, debug: true },
    passportjs: { name: 'My App Connector', authenticationURL: 'https://piedpiper.ngrok-free.app/fusionauth/connector', timeout: 5000, debug: true },
    rails: { name: 'My App Connector', authenticationURL: 'https://piedpiper.ngrok-free.app/fusionauth/connector', timeout: 5000, debug: true },
    pingone: { name: 'PingIdentityConnector', authenticationURL: 'https://piedpiper.ngrok-free.app/api/RopcProxy?code=s0ndU863xdbXsFO4dLZAJQXLzyTU789iaUJ43uLAtIkXm_AzFuFWP1zg==', importTenant: true },
    azureadb2c: { name: 'Azure AD B2C migration', authenticationURL: 'https://piedpiper.azurewebsites.net/api/RopcProxy?code=s0ndU863xdbXsFO4dLZAJQXLzyTU789iaUJ43uLAtIkXm_AzFuFWP1zg==', importTenant: true },
    cognito: { name: 'Cognito migration', authenticationURL: 'https://k12hcvhgk.execute-api.us-east-2.amazonaws.com/call', importTenant: true, header: ['Authorization', '2687EE95-AF19-4CE6-A8BD-963139DED32E'] },
  },
};
Object.values(migration.providers).forEach((provider, index) => {
  provider.connectorId = `00000000-0000-0000-0000-f1000000008${index}`;
  provider.tenantId = provider.importTenant ? migration.importTenantId : `00000000-0000-0000-0000-f1000000009${index}`;
});

// screenshots that show the migration test tenant
const migrationTenantShots = [
  'migration-tenant-list', 'migration-tenant-delete', 'migration-api-key-add', 'migration-api-key-permissions', 'migration-application-add',
  'migration-application-login-url', 'migration-role-add', 'migration-users-list', 'migration-user-login', 'migration-import-tenant-add-policy',
  ...Object.entries(migration.providers).filter(([, p]) => p.importTenant).flatMap(([key]) => [`migration-${key}-connector-policy`, `migration-${key}-connector-added`]),
];
const migrationConnectorShots = ['migration-add-connector', 'migration-add-connector-policy', 'migration-delete-connector-policy', 'migration-connectors-list', 'migration-tenant-connector-policies'];
const migrationScimShots = [
  'scim-sdk-server-type-details', 'scim-sdk-client-type-details', 'scim-sdk-server-entity-add', 'scim-sdk-server-entity-details', 'scim-sdk-client-entity-add', 'scim-sdk-client-entity-details',
  'scim-sdk-entities-manage', 'scim-sdk-client-grants', 'scim-sdk-grant-search', 'scim-sdk-grant-permissions', 'scim-sdk-entities-ids', 'scim-sdk-client-secret', 'scim-sdk-tenant-settings', 'scim-sdk-user-added',
];
// windows kept at the screenshot's height, like the originals
Object.assign(fixedHeight, Object.fromEntries([
  'migration-add-tenant', 'migration-add-application', 'migration-api-key-details', 'migration-add-connector', 'migration-add-connector-policy',
  'migration-delete-connector-policy', 'migration-reset-user-password', 'migration-generic-connector-add', 'migration-ldap-connector-add',
  'migration-api-key-add', 'migration-application-add', 'migration-application-login-url', 'migration-role-add', 'migration-users-list',
  'migration-tenant-delete', 'migration-connector-add-menu', 'migration-example-app-login-url', 'migration-example-app-roles',
  'migration-example-users', 'migration-import-tenant-add-policy', 'migration-passportjs-idp',
  ...Object.keys(migration.providers).flatMap(key => [`migration-${key}-connector`, `migration-${key}-connector-policy`, `migration-${key}-connector-added`]),
  ...migrationScimShots.filter(name => name !== 'scim-sdk-tenant-settings'), 'scim-sdk-server-type-add', 'scim-sdk-client-type-add', 'scim-sdk-lambdas', 'scim-sdk-user-request-lambda',
].map(name => [name, null])));
fixedHeight['migration-api-key-permissions'] = "[data-hl='migration-scroll']";
fixedHeight['migration-example-app-redirect'] = "[data-hl='migration-scroll']";
fixedHeight['scim-sdk-tenant-settings'] = 'SCIM server settings';

// opens a dropdown menu and leaves a plain copy of it, since the menu can close before the capture
async function migrationOpenMenu(page, button) {
  await button.click();
  const menu = page.locator('el-menu:popover-open').first();
  await menu.waitFor();
  // let the menu finish opening and take its place
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const menu = document.querySelector('el-menu:popover-open');
    // Measure the open menu rather than an intermediate animation scale.
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.dataset.menuCopy = '';
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
    document.body.append(copy);
    menu.hidePopover();
  });
}

// opens the details dialog of a list row and marks the row with the given label
async function migrationDetails(page, href, label, tagName) {
  await page.evaluate(h => {
    const link = document.querySelector(`main a[href="${h}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, href);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(800);
  const found = await page.evaluate(([l, t]) => {
    const dialog = document.querySelector('.prime-dialog.open');
    for (const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT); walker.nextNode();) {
      walker.currentNode.textContent = walker.currentNode.textContent.replaceAll('http://localhost:9011', 'https://local.fusionauth.io');
    }
    if (!l) return true;
    const row = [...dialog.querySelectorAll('tr')].find(r => new RegExp(`^(${l})`).test(r.textContent.trim()));
    if (!row) return false;
    let scroller = row.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    if (scroller) scroller.scrollTop += row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 160;
    row.dataset.hl = t;
    return true;
  }, [label, tagName]);
  if (!found) throw new Error(`no ${label} row`);
}

async function migrationAddPolicy(page, connector, submit) {
  await page.locator('#add-connector-policy').click();
  await page.locator('.prime-dialog.open').waitFor();
  await page.locator('.prime-dialog.open #connectorId').selectOption({ label: connector });
  await page.evaluate(() => { const m = document.querySelector('.prime-dialog.open #connectorMigrate'); if (!m.checked) m.click(); });
  await page.waitForTimeout(500);
  if (!submit) return;
  await page.locator('.prime-dialog.open button[type=submit]').click();
  await page.locator('.prime-dialog.open').waitFor({ state: 'detached' });
  await page.waitForTimeout(500);
  // move the new policy above the default one
  await page.evaluate(name => {
    const row = [...document.querySelectorAll('#connectors tbody tr')].find(r => r.textContent.includes(name));
    row.querySelector('.updown.up').click();
  }, connector);
  await page.waitForTimeout(300);
}

async function migrationFillConnector(page, provider) {
  await page.fill('#connector_name', provider.name);
  await page.fill('#connector_authenticationURL', provider.authenticationURL);
  if (provider.timeout) {
    await page.fill('#connector_connectTimeout', String(provider.timeout));
    await page.fill('#connector_readTimeout', String(provider.timeout));
  }
  if (provider.debug) await page.evaluate(() => { const d = document.getElementById('connector_debug'); if (!d.checked) d.click(); });
  await page.waitForTimeout(500);
  if (provider.header) {
    await selectTab(page, 'Headers');
    await page.locator('#header-add-button').click();
    await page.waitForTimeout(300);
    const inputs = page.locator('#headers tbody input[type=text]');
    await inputs.nth(0).fill(provider.header[0]);
    await inputs.nth(1).fill(provider.header[1]);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
}

// runs after the page's own tab handling, before the window is sized
async function migrationBeforeSizing(page, name, tag) {
  const providerMatch = name.match(/^migration-(\w+)-connector(-policy|-added)?$/);
  const provider = providerMatch && migration.providers[providerMatch[1]];
  if (provider && !providerMatch[2]) await migrationFillConnector(page, provider);
  if (provider && providerMatch[2]) await migrationAddPolicy(page, provider.name, providerMatch[2] === '-added');

  if (name === 'migration-tenant-list') {
    await tag('import-tenant-id', new Function(`return () => [...document.querySelectorAll('td')].find(td => td.textContent.trim() === '${migration.importTenantId}')`)());
  }
  if (name === 'migration-add-tenant') await page.fill('#tenant_name', 'Pied Piper');
  if (name === 'migration-add-application') {
    await page.fill('#application_name', 'Pied Piper');
    for (const [role, column] of [['user', 'isDefault'], ['admin', 'isSuperRole']]) {
      await page.locator('#role-add-button').click();
      await page.waitForTimeout(300);
      const row = page.locator('#roles tbody tr').last();
      await row.locator('input[type=text]').first().fill(role);
      await row.locator(`input[type=checkbox][name*='${column}']`).check();
    }
  }
  if (name === 'migration-add-connector-policy') await migrationAddPolicy(page, 'Legacy User API', false);
  if (name === 'migration-delete-connector-policy') await migrationAddPolicy(page, 'Legacy User API', true);
  if (name === 'migration-import-tenant-add-policy') await tag('migration-add-policy', () => document.getElementById('add-connector-policy'));
  if (name === 'migration-rehash-on-login') await tag('migration-rehash', () => document.getElementById('tenant_passwordEncryptionConfiguration_modifyEncryptionSchemeOnLogin-form-row'));
  if (name === 'migration-generic-connector-security' || name === 'migration-generic-connector-headers') {
    await selectTab(page, name.endsWith('security') ? 'Security' : 'Headers');
  }

  if (name === 'migration-ldap-connector-directory') await selectTab(page, 'Directory');

  if (['migration-passportjs-connector', 'migration-rails-connector', 'migration-akamai-connector', 'migration-frontegg-connector'].includes(name)) {
    await tag('migration-connector-fields', () => {
      const ids = ['connector_name', 'connector_authenticationURL', 'connector_connectTimeout', 'connector_readTimeout'];
      const rects = ids.map(id => document.getElementById(id + '-form-row').getBoundingClientRect());
      const box = document.createElement('div');
      box.style.cssText = `position:absolute;left:${rects[0].left + scrollX}px;top:${rects[0].top + scrollY}px;width:${rects[0].width}px;height:${rects.at(-1).bottom - rects[0].top}px;pointer-events:none`;
      document.body.append(box);
      return box;
    });
  }

  if (name === 'migration-api-key-add' || name === 'migration-api-key-permissions') {
    await page.fill('#apiKey_name', 'Import key');
    await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'For user import');
    await page.fill('#apiKey_key', 'r8Uj2qR4cKzWm7XvNp3tYb6dFh9LsGa1EwQo5Ti0MnPx_Kc');
    await page.locator('#tenantId').selectOption(migration.importTenantId);
  }
  if (name === 'migration-api-key-permissions') {
    await page.evaluate(() => {
      const rows = ['/api/user/forgot-password', '/api/user/import', '/api/user/search'].map(endpoint => {
        const row = [...document.querySelectorAll('main tr')].find(r => r.querySelector('td')?.textContent.trim() === endpoint);
        // the columns are GET, POST, PUT, PATCH, DELETE
        const post = row.querySelectorAll('input[type=checkbox]')[1];
        if (!post.checked) post.click();
        row.dataset.hl = 'migration-permission-' + endpoint.split('/').at(-1);
        return row;
      });
      let above = rows[0];
      for (let i = 0; i < 6; i++) above = above.previousElementSibling;
      above.dataset.hl = 'migration-scroll';
    });
  }
  if (name === 'migration-application-add') {
    await page.fill('#application_name', 'Import test application');
    await page.locator('#tenantId').selectOption(migration.importTenantId);
    await selectTab(page, 'OAuth');
    await page.getByLabel('Client secret', { exact: true }).evaluate(el => { el.value = 'import-test-secret-not-for-production'; });
    await page.locator('#redirectURLs-display input').fill('https://example.com');
    await page.locator('#redirectURLs-display input').press('Enter');
    await page.evaluate(() => document.getElementById('redirectURLs-form-row').dataset.hl = 'migration-redirect');
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  if (name === 'migration-example-app-redirect') {
    await page.locator('#redirectURLs-display input').fill('http://localhost:7771/callback');
    await page.locator('#redirectURLs-display input').press('Enter');
    await page.evaluate(() => document.getElementById('redirectURLs-form-row').dataset.hl = 'migration-redirect');
    await page.evaluate(() => document.getElementById('application_oauthConfiguration_clientId-form-row').dataset.hl = 'migration-scroll');
  }
  if (name === 'migration-role-add') {
    await page.locator('main a[href^="/ajax/application/add-role"]').click();
    await page.locator('.prime-dialog.open #role_name').waitFor();
    await page.waitForTimeout(500);
    await page.fill('.prime-dialog.open #role_name', 'user');
    await page.evaluate(() => { const d = document.querySelector('.prime-dialog.open #role_isDefault'); if (!d.checked) d.click(); });
    await page.waitForTimeout(500);
  }
  if (name === 'migration-application-login-url') await migrationDetails(page, `/ajax/application/view/${migration.importAppId}`, 'OAuth IdP login URL|Login URLs?:', 'migration-login-url');
  if (name === 'migration-example-app-login-url') await migrationDetails(page, `/ajax/application/view/${piedPiperAppId}`, 'OAuth IdP login URL|Login URLs?:', 'migration-login-url');
  if (name === 'migration-api-key-details') {
    migration.context = page.context();
    if (!(await page.locator(`main a[href="/ajax/api-key/view/${migration.apiKeyId}"]`).count())) {
      await page.goto('http://localhost:9011/admin/api-key/add', { waitUntil: 'networkidle' });
      await page.fill('#apiKeyId', migration.apiKeyId);
      await page.fill('#apiKey_name', 'Import key');
      await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'For user import');
      await page.fill('#apiKey_key', 'r8Uj2qR4cKzWm7XvNp3tYb6dFh9LsGa1EwQo5Ti0MnPx_Kc');
      await page.evaluate(() => document.querySelector("input[type=checkbox][name=\"apiKey.permissions.endpoints['/api/user/import']\"][value=POST]").click());
      await page.evaluate(() => document.getElementById('api-key-form').requestSubmit());
      await page.waitForURL(u => /\/admin\/api-key\/?$/.test(u.pathname));
      await page.waitForLoadState('networkidle');
    }
    await migrationDetails(page, `/ajax/api-key/view/${migration.apiKeyId}`);
  }
  if (name === 'migration-example-app-roles') await tag('migration-roles', () => document.querySelector('main tbody'));
  if (name === 'migration-users-list' || name === 'migration-example-users') {
    const ids = (name === 'migration-users-list' ? migration.importUsers : migration.exampleUsers).map(([id]) => id);
    await page.fill('#s_queryString', 'example.com');
    await page.keyboard.press('Enter');
    await page.waitForFunction(n => document.querySelectorAll('main tbody tr').length === n, ids.length, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await tag('migration-users', new Function(`return () => {
      const rows = ${JSON.stringify(ids)}.map(id => document.querySelector(\`main a[href*="\${id}"]\`)?.closest('tr'));
      if (rows.some(r => !r)) return null;
      const a = rows[0].getBoundingClientRect(), b = rows.at(-1).getBoundingClientRect();
      const box = document.createElement('div');
      box.style.cssText = \`position:absolute;left:\${a.left + scrollX}px;top:\${Math.min(a.top, b.top) + scrollY}px;width:\${a.width}px;height:\${Math.abs(b.top - a.top) + a.height}px;pointer-events:none\`;
      document.body.append(box);
      return box;
    }`)());
  }
  if (name === 'migration-user-login') {
    await page.fill('#loginId', migration.importUsers[0][1]);
    await page.fill('#password', 'password');
  }

  // SCIM guide
  const scim = migration.scim;
  if (name === 'scim-sdk-server-type-details') await page.fill('#entityType_name', 'SCIM Server');
  if (name === 'scim-sdk-client-type-details') await page.fill('#entityType_name', 'SCIM Client');
  if (name === 'scim-sdk-server-entity-add' || name === 'scim-sdk-client-entity-add') {
    await page.locator('main a[href="add"]').waitFor();
    await tag('scim-add', () => document.querySelector('main a[href="add"]'));
  }
  if (name === 'scim-sdk-server-entity-details' || name === 'scim-sdk-client-entity-details') {
    const server = name === 'scim-sdk-server-entity-details';
    await page.fill('#entity_name', server ? 'SCIM Server for Default Tenant' : 'SCIM Client for SCIM-SDK Client App');
    await page.locator('#entity_type_id').selectOption(server ? scim.serverTypeId : scim.clientTypeId);
    await page.evaluate(() => document.getElementById('entity_type_id-form-row').dataset.hl = 'scim-type');
  }
  if (['scim-sdk-entities-manage', 'scim-sdk-entities-ids', 'scim-sdk-client-secret'].includes(name)) {
    await page.locator('main input[type=text]').first().fill('SCIM');
    await page.locator('main button', { hasText: 'Search' }).first().click();
    await page.waitForFunction(id => document.querySelector(`main tbody a[href*="${id}"]`), scim.clientId, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  }
  if (name === 'scim-sdk-client-entity-add') {
    await page.locator('main input[type=text]').first().fill('SCIM Server');
    await page.locator('main button', { hasText: 'Search' }).first().click();
    await page.waitForFunction(id => document.querySelector(`main tbody a[href*="${id}"]`), scim.serverId);
  }
  if (name === 'scim-sdk-entities-ids') {
    await tag('scim-ids', new Function(`return () => {
      const cells = ${JSON.stringify([scim.clientId, scim.serverId])}.map(id => [...document.querySelectorAll('main td')].find(td => td.textContent.trim() === id));
      if (cells.some(c => !c)) return null;
      const a = cells[0].getBoundingClientRect(), b = cells[1].getBoundingClientRect();
      const box = document.createElement('div');
      box.style.cssText = \`position:absolute;left:\${a.left + scrollX}px;top:\${a.top + scrollY}px;width:\${a.width}px;height:\${b.bottom - a.top}px;pointer-events:none\`;
      document.body.append(box);
      return box;
    }`)());
  }
  if (name === 'scim-sdk-client-secret') await migrationDetails(page, `/ajax/entity/view/${scim.clientId}?tenantId=${defaultTenantId}`, 'Client secret', 'scim-secret');
  if (name === 'scim-sdk-client-grants') await tag('scim-add', () => document.querySelector('main a[href^="/admin/entity/grant/upsert"]'));
  if (name === 'scim-sdk-grant-search') {
    await page.locator('#entity').pressSequentially('SCIM Server', { delay: 50 });
    await page.getByText('SCIM Server for Default Tenant').first().waitFor();
    await page.waitForTimeout(500);
  }
  if (name === 'scim-sdk-grant-permissions') {
    await page.evaluate(() => {
      for (const box of document.querySelectorAll('main input[name="grant.permissions"]')) {
        if (['scim:user:create', 'scim:user:read'].includes(box.value) && !box.checked) box.click();
      }
    });
  }
  if (name === 'scim-sdk-lambdas') {
    await page.locator('main input[type=text]').first().fill('SCIM');
    await page.locator('main button', { hasText: 'Search' }).first().click();
    await page.waitForFunction(() => document.querySelectorAll('main tbody tr').length === 4);
    await tag('scim-lambdas', () => {
      const rows = [...document.querySelectorAll('main tbody tr')].filter(r => /SCIM/.test(r.querySelector('td')?.textContent));
      if (rows.length !== 4) return null;
      const a = rows[0].getBoundingClientRect(), b = rows[3].getBoundingClientRect();
      const box = document.createElement('div');
      box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
      document.body.append(box);
      return box;
    });
  }
  if (name === 'scim-sdk-user-request-lambda') {
    const href = await page.evaluate(() => [...document.querySelectorAll('main tbody tr')].find(r => r.textContent.includes('SCIM User Request Converter')).querySelector('a[href^="edit/"]').getAttribute('href'));
    await page.goto(new URL(href, page.url()).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }
  if (name === 'scim-sdk-tenant-settings') {
    const selects = {
      tenant_scimServerConfiguration_clientEntityTypeId: 'SCIM Client', tenant_scimServerConfiguration_serverEntityTypeId: 'SCIM Server',
      tenant_lambdaConfiguration_scimUserRequestConverterId: '[FusionAuth Default] SCIM User Request Converter',
      tenant_lambdaConfiguration_scimUserResponseConverterId: '[FusionAuth Default] SCIM User Response Converter',
      tenant_lambdaConfiguration_scimEnterpriseUserRequestConverterId: '[FusionAuth Default] SCIM User Request Converter',
      tenant_lambdaConfiguration_scimEnterpriseUserResponseConverterId: '[FusionAuth Default] SCIM User Response Converter',
      tenant_lambdaConfiguration_scimGroupRequestConverterId: '[FusionAuth Default] SCIM Group Request Converter',
      tenant_lambdaConfiguration_scimGroupResponseConverterId: '[FusionAuth Default] SCIM Group Response Converter',
    };
    for (const [id, label] of Object.entries(selects)) await page.locator(`#${id}`).selectOption({ label });
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  if (name === 'scim-sdk-user-added') {
    await tag('scim-user', new Function(`return () => document.querySelector('main a[href*="${scim.userId}"]')?.closest('tr')`)());
  }
}

// menus open last, after the window is sized
async function migrationAfterSizing(page, name, tag, highlights) {
  if (name === 'scim-sdk-client-grants') {
    await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, '2026-10-28T09:07:06.468Z');
    });
  }
  if (name === 'scim-sdk-entities-ids') {
    await page.evaluate(ids => {
      const cells = ids.map(id => [...document.querySelectorAll('main td')].find(td => td.textContent.trim() === id));
      const a = cells[0].getBoundingClientRect(), b = cells[1].getBoundingClientRect();
      const box = document.querySelector('[data-hl="scim-ids"]');
      box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    }, [migration.scim.clientId, migration.scim.serverId]);
  }
  if (name === 'migration-example-app-roles') {
    await page.evaluate(() => [...document.querySelectorAll('main tbody tr')].forEach((row, index) => {
      const cell = row.querySelectorAll('td')[1];
      if (cell) cell.textContent = `00000000-0000-0000-0000-f100000000b${index}`;
    }));
  }
  if (name === 'scim-sdk-lambdas') {
    await page.evaluate(() => [...document.querySelectorAll('main tbody tr')].filter(row => /SCIM/.test(row.querySelector('td')?.textContent)).forEach((row, index) => {
      row.querySelectorAll('td')[1].textContent = `00000000-0000-0000-0000-f100000000a${index}`;
    }));
  }
  if (name === 'scim-sdk-user-request-lambda') {
    await page.evaluate(() => { const id = document.querySelector('#lambdaId, #lambda_id'); if (id) id.value = '00000000-0000-0000-0000-f100000000a2'; });
  }

  if (name === 'scim-sdk-server-type-add' || name === 'scim-sdk-client-type-add') {
    await migrationOpenMenu(page, page.locator('main el-dropdown button').first());
    await tag('scim-add', new Function(`return () => document.querySelector('[data-menu-copy] #add-scim-${name.includes('server') ? 'server' : 'client'}')`)());
  }
  if (name === 'scim-sdk-entities-manage') {
    await migrationOpenMenu(page, page.locator('main tbody tr', { hasText: migration.scim.clientId }).locator('el-dropdown button'));
    await tag('scim-manage', () => [...document.querySelectorAll('[data-menu-copy] a')].find(a => a.textContent.trim() === 'Manage'));
  }
  if (name === 'migration-reset-user-password') {
    await migrationOpenMenu(page, page.locator('header el-dropdown button'));
    await tag('migration-reset', () => document.querySelector('[data-menu-copy] #send-password-reset'));
  }
  if (name === 'migration-add-connector' || name === 'migration-connector-add-menu') {
    await migrationOpenMenu(page, page.locator('main el-dropdown button').first());
    if (name === 'migration-connector-add-menu') await tag('migration-add-generic', () => document.querySelector('[data-menu-copy] #add-generic'));
  }
  if (name === 'migration-tenant-delete') {
    await migrationOpenMenu(page, page.locator('main tbody tr', { hasText: migration.importTenantId }).locator('el-dropdown button'));
    await tag('migration-delete', () => [...document.querySelectorAll('[data-menu-copy] a')].find(a => a.textContent.trim() === 'Delete'));
  }
  if (name === 'migration-delete-connector-policy') {
    await migrationOpenMenu(page, page.locator('#connectors tbody tr', { hasText: 'Legacy User API' }).locator('el-dropdown button'));
    await tag('migration-delete', () => [...document.querySelectorAll('[data-menu-copy] a')].find(a => a.textContent.trim() === 'Delete'));
  }
  if (!(name in bands)) {
    // A viewport crop preserves the framing when highlights would otherwise scroll to the centre.
    await page.evaluate(() => {
      const frame = document.createElement('div');
      frame.dataset.migrationWindow = '';
      frame.style.cssText = `position:absolute;left:0;top:${scrollY}px;width:${innerWidth}px;height:${innerHeight}px;pointer-events:none`;
      document.body.append(frame);
    });
    const clipped = await page.evaluate(specs => specs.filter(({ selector }) => {
      const el = document.querySelector(selector);
      if (!el) return true;
      const r = el.getBoundingClientRect();
      return r.top < 0 || r.left < 0 || r.bottom > innerHeight || r.right > innerWidth;
    }).map(({ selector }) => selector), highlights);
    if (clipped.length) throw new Error(`migration highlight outside frame: ${clipped.join(', ')}`);
  }

}
// identity providers: two applications, the keys and one IdP of each kind the guides set up
const idpId = n => `00000000-0000-0000-0000-f2${String(n).padStart(10, '0')}`;
const piperChatId = idpId(1);
// its managed-domain IdPs make the login page ask for the email first
const piperNetId = idpId(2);
const idpSampleCertificate = `-----BEGIN CERTIFICATE-----
MIICHzCCAYigAwIBAgIUUPGNuenG+190R8nyn9AD/SE6phswDQYJKoZIhvcNAQEL
BQAwMjEbMBkGA1UEAwwScGllZHBpcGVyLm9rdGEuY29tMRMwEQYDVQQKDApQaWVk
IFBpcGVyMB4XDTI2MTAyNzExNTYyMloXDTM2MTAyNDExNTYyMlowMjEbMBkGA1UE
AwwScGllZHBpcGVyLm9rdGEuY29tMRMwEQYDVQQKDApQaWVkIFBpcGVyMIGfMA0G
CSqGSIb3DQEBAQUAA4GNADCBiQKBgQDnJM7eRh8WNiKjtAw1rBUYqY7Z7K3ZR20o
ac6WDsBNRhNxCF257ut9AvfI304GBrTLmnnZPkZ4QGu9J9zsAewH5ST04zTZkm8X
Iun3OPoKVdYil7So3EhjXnQTYRWILdo/B1FER54hfrKf4C45BoiXDDmFAQVgmz49
uZ9yDSzF5wIDAQABozIwMDAdBgNVHQ4EFgQUgi8hkWg9G+Hq1L3IGIgDmuY/41Mw
DwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQCU1wjDZEwMIV6rXAo5
GTnj9ELv06LegQUuwSUZvTltf8iORFybC9OwlsIJKQ7umK6dJEqpR06Gp9AKVNg7
kCmTo84722EIs6/R+A2TdEuD2eaQm3GivAoZ/tnGuhNPtBlT3jUIHveTIbYp5oAc
2nidS02eNrHNTEHZ+M2YXqZeTg==
-----END CERTIFICATE-----`;
const idpSampleEcKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg8c440Nd8eZ7Wq+iv
QRYFuhmKJNTByaeKOAaRX4kvuaOhRANCAAQDgVPSJtir5sb+Xoyl1LUC0TZRqc2W
c/1mG2iO+WKjDmuXn0v4C+QueIdgVj+KMwlAHR6Z9thejebzW2aTmmjw
-----END PRIVATE KEY-----`;
const idpKeys = [[201, 'ADFS Certificate', 'RS256'], [202, 'Azure AD Certificate', 'RS256'], [203, 'Pied Piper Okta IdP', 'RS256'], [204, 'Pied Piper SAML Certificate', 'RS256'], [205, 'Apple Private Key', 'ES256'], [206, 'Pied Piper Mobile Key', 'HS256']];
const idpApps = (app = piperChatId) => ({ [app]: { enabled: true, createRegistration: true } });
const idpOidc = (name, buttonText, endpoints, oauth2, extra = {}) => ({
  type: 'OpenIDConnect', name, enabled: true, buttonText, applicationConfiguration: idpApps(), ...extra,
  oauth2: { clientAuthenticationMethod: 'client_secret_basic', scope: 'openid', authorization_endpoint: `${endpoints}/authorize`, token_endpoint: `${endpoints}/token`, userinfo_endpoint: `${endpoints}/userinfo`, ...oauth2 },
});
const idpDefinitions = {
  101: idpOidc('Okta', 'Login with Okta', 'https://piedpiper.okta.com/oauth2/v1', { client_id: '0oa3xfv009bZYlCp4697', client_secret: 'd8DthWkNRBRQhkGxp', scope: 'openid email' }),
  102: idpOidc('Pied Piper with Azure AD', 'Login with Azure AD', 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/oauth2/v2.0', { client_id: '7bbfc733-5f74-4ed2-a54c-c2b4f2098cac', client_secret: 'oV-Zch01m2UjgdB.x5_yJjF9_wNl0pVga_' }),
  103: idpOidc('Cognito', 'Login with Cognito', 'https://piedpiper.auth.us-east-2.amazoncognito.com/oauth2', { client_id: '1dejfipvspjcghttmle', client_secret: '19i51qiit5r6fqme8d09srhgmdoq1kpjev' }),
  104: idpOidc('Discord OIDC', 'Login with Discord', 'https://discord.com/api/oauth2', {
    client_id: '869975291286683692', client_secret: 'sB7UbnirswU1USOuJRs_HiYGwoW2kkNx', clientAuthenticationMethod: 'client_secret_post',
    userinfo_endpoint: 'https://discord.com/api/users/@me', scope: 'identify email', uniqueIdClaim: 'id', emailVerifiedClaim: 'verified',
  }, { debug: true }),
  105: idpOidc('GitHub', 'Login with GitHub', 'https://github.com/login/oauth', {
    client_id: 'Iv1.ad9ec654d44e5a75', client_secret: '08fba234c621eb3aa84ac7112a18073fc92bc030',
    token_endpoint: 'https://github.com/login/oauth/access_token', userinfo_endpoint: 'https://api.github.com/user', scope: 'user:email',
  }, { linkingStrategy: 'LinkAnonymously', debug: true }),
  106: idpOidc('Pied Piper', 'Login with Pied Piper', 'https://login.piedpiper.com/oauth2', { client_id: '7a3906ee-b105-4ff9-bf9a-16df55c93f3f', client_secret: '3uOQq-IxbZkh38KeI1AnoS9io5SnT3Np1vwqvGibWPs' }),
  107: idpOidc('Pied Piper Workforce', 'Login with Pied Piper Workforce', 'https://workforce.piedpiper.com/oauth2', { client_id: '3f1b7c2e-9d4a-4e6b-8a1f-5c2d7e9b0a14', client_secret: 'Wf7nQ2xLp9Rt4Kv8Zs3Hy6Bm1Jc5Dg0F' }, { domains: ['piedpiper.com'], applicationConfiguration: idpApps(piperNetId) }),
  111: { type: 'SAMLv2', name: 'ADFS', enabled: true, idpEndpoint: 'https://adfs.piedpiper.com/adfs/ls', keyId: idpId(201), useNameIdForEmail: true, buttonText: 'Login with ADFS', debug: true, applicationConfiguration: idpApps() },
  112: { type: 'SAMLv2', name: 'Pied Piper via SAML', enabled: true, idpEndpoint: 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/saml2', keyId: idpId(202), buttonText: 'Login with SAML + Azure', emailClaim: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress', debug: true, applicationConfiguration: idpApps() },
  113: { type: 'SAMLv2', name: 'Okta SAML', enabled: true, idpEndpoint: 'https://piedpiper.okta.com/app/piedpiper_fusionauth_1/exk1jx8gwx2nxMcan697/sso/saml', keyId: idpId(203), buttonText: 'Login with Okta', uniqueIdClaim: 'userid', emailClaim: 'email', applicationConfiguration: idpApps() },
  114: { type: 'SAMLv2', name: 'Pied Piper SAML', enabled: true, idpEndpoint: 'https://login.piedpiper.com/samlv2/sso', keyId: idpId(204), buttonText: 'Login with Pied Piper', applicationConfiguration: idpApps() },
  121: { type: 'SAMLv2IdPInitiated', name: 'Pied Piper IdP Initiated Login', enabled: true, issuer: 'http://www.okta.com/exk1jx8gwx2nxMcan697', keyId: idpId(203), uniqueIdClaim: 'userId', emailClaim: 'email', debug: true, applicationConfiguration: idpApps() },
  131: { type: 'Apple', name: 'Apple', enabled: true, buttonText: 'Sign in with Apple', servicesId: 'com.piedpiper.piperchat.login', teamId: 'R4NQ1P4UEB', keyId: idpId(205), scope: 'email name', applicationConfiguration: idpApps() },
  132: { type: 'Facebook', name: 'Facebook', enabled: true, buttonText: 'Login with Facebook', appId: '1052841945310473', client_secret: 'c2a7b3f1e94d8a6b5c0e7f2d1a9b8c3e', permissions: 'email', fields: 'name,email', loginMethod: 'UseRedirect', applicationConfiguration: idpApps() },
  133: { type: 'Google', name: 'Google', enabled: true, buttonText: 'Sign in with Google', client_id: '718294035516-piperchat-login.apps.googleusercontent.com', client_secret: 'PiedPiper-Google-S3cret-7Kq9Lm2Nx5', scope: 'profile email openid', loginMethod: 'UseRedirect', debug: true, tenantConfiguration: { '30663132-6464-6665-3032-326466613934': { limitUserLinkCount: { enabled: true, maximumLinks: 2 } } }, applicationConfiguration: idpApps() },
  134: { type: 'LinkedIn', name: 'LinkedIn', enabled: true, buttonText: 'Sign in with LinkedIn', client_id: '86xq2a8kvyj4wz', client_secret: 'Wd8xV2k9Lp3TnQ7r', scope: 'openid profile email', applicationConfiguration: idpApps() },
  135: { type: 'Twitter', name: 'Twitter', enabled: true, buttonText: 'Login with Twitter', consumerKey: 'Gq5LwYp2k8XnT3vR9cZb1Mh7d', consumerSecret: 'pK4rT8yW2nB6vX1qL9mJ3fH7sD5gA0zC8eU2iO4tR6wY1nM3', applicationConfiguration: idpApps() },
  141: { type: 'EpicGames', name: 'Epic Games', enabled: true, buttonText: 'Login with Epic Games', client_id: 'xyza7891PiedPiperEpic0123', client_secret: 'Ep1cS3cretPiedPiper7Kq9Lm2Nx5', applicationConfiguration: idpApps() },
  142: { type: 'Nintendo', name: 'Nintendo', enabled: true, buttonText: 'Login with Nintendo', client_id: '3d4f6a8b1c2e5f70', client_secret: 'N1ntend0S3cretPiedPiper9xQ2', uniqueIdClaim: 'id', emailClaim: 'email', usernameClaim: 'preferred_username', applicationConfiguration: idpApps() },
  143: { type: 'SonyPSN', name: 'Sony PlayStation Network', enabled: true, buttonText: 'Login with PlayStation Network', client_id: '8f2a6c4e-1b3d-4e5f-9a7b-2c4d6e8f0a1b', client_secret: 'PsnS3cretPiedPiper4Rt7Yu2', scope: 'psn:s2s openid id_token:psn.basic_claims', applicationConfiguration: idpApps() },
  144: { type: 'Steam', name: 'Steam', enabled: true, buttonText: 'Login with Steam', client_id: 'pied-piper-steam', webAPIKey: '3F9A1C7E5B2D8F4A6C0E9B1D7F3A5C2E', scope: 'openid', applicationConfiguration: idpApps() },
  145: { type: 'Twitch', name: 'Twitch', enabled: true, buttonText: 'Login with Twitch', client_id: 'gp762nuuoqcoxypju8c569th9wz7q5', client_secret: 'k7s0w2x9q4v1m8n3b6c5z2l0p9o8i7', scope: 'openid user:read:email', applicationConfiguration: idpApps() },
  146: { type: 'Xbox', name: 'Xbox', enabled: true, buttonText: 'Login with Xbox', client_id: 'b4f8e2a6-3c1d-4e9f-8a7b-6c5d4e3f2a10', client_secret: 'Xb0x~S3cretPiedPiper.9Kq2Lm', scope: 'Xboxlive.signin Xboxlive.offline_access', applicationConfiguration: idpApps() },
  151: { type: 'HYPR', name: 'HYPR', enabled: true, relyingPartyApplicationId: 'piedpiper-hypr', relyingPartyURL: 'https://piedpiper.hypr.com', applicationConfiguration: idpApps(piperNetId) },
  161: { type: 'ExternalJWT', name: 'Pied Piper Mobile', enabled: true, headerKeyParameter: 'kid', oauth2: { uniqueIdClaim: 'sub', emailClaim: 'email', emailVerifiedClaim: 'email_verified', usernameClaim: 'preferred_username' }, verificationKeyIds: [idpId(206)], claimMap: {}, domains: ['mobile.piedpiper.com'], linkingStrategy: 'LinkAnonymously', applicationConfiguration: idpApps(piperNetId) },
};

// login pages: the IdP whose button the screenshot shows, or null for the page that asks for the email first
const idpLogins = {
  'idp-login-adfs': 111, 'idp-login-azure-oidc': 102, 'idp-login-azure-saml': 112, 'idp-login-cognito': 103, 'idp-login-okta-oidc': 101,
  'idp-login-okta-saml': 113, 'idp-login-discord': 104, 'idp-login-nintendo': 142, 'idp-login-sony': 143, 'idp-login-steam': 144,
  'idp-login-twitch': 145, 'idp-login-xbox': 146, 'idp-login-openid-connect': 106, 'idp-login-samlv2': 114, 'idp-login-apple': 131,
  'idp-login-facebook': 132, 'idp-login-github': 105, 'idp-login-google': 133, 'idp-login-linkedin': 134, 'idp-login-twitter': 135,
  'idp-login-managed-domain': null,
};

const idpIntegrationDetails = 'SAML v2 Integration details';
// what each identity provider screenshot does on its page; field names are element ids
const idpShots = {
  ...Object.fromEntries(Object.entries(idpLogins).map(([name, n]) => [name, { login: n }])),
  'idp-add-menu-openid-connect': { menu: 'add/OpenIDConnect' },
  'idp-add-menu-samlv2': { menu: 'add/SAMLv2' },
  'idp-add-menu-twitter': { menu: 'add/Twitter' },
  'idp-cors-warning-okta': {},
  'idp-cors-warning-samlv2': {},
  'idp-cors-warning-apple': {},
  'idp-list-samlv2-view': { rowMenu: 114 },
  'idp-list-saml-idp-initiated-view': { rowMenu: 121 },
  'idp-view-adfs': { view: 111 },
  'idp-view-azure-saml': { view: 112, viewBox: idpIntegrationDetails },
  'idp-view-okta-saml': { view: 113, viewBox: idpIntegrationDetails },
  'idp-view-samlv2': { view: 114, viewBox: idpIntegrationDetails },
  'idp-view-saml-idp-initiated': { view: 121, viewBox: idpIntegrationDetails },
  'idp-adfs-edit': {},
  'idp-azure-oidc-edit': { fill: { identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/azure-ad.svg', identityProvider_oauth2_issuer: 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/v2.0' } },
  'idp-azure-oidc-applications': {},
  'idp-azure-saml-edit': { scroll: 'identityProvider_name' },
  'idp-azure-saml-options': {},
  'idp-azure-saml-applications': {},
  'idp-cognito-edit': { fill: { identityProvider_oauth2_issuer: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_PiedPiper' } },
  'idp-hypr-add': {},
  'idp-okta-oidc-edit': { fill: { identityProvider_oauth2_issuer: 'https://piedpiper.okta.com' } },
  'idp-okta-idp-initiated-edit': {},
  'idp-okta-idp-initiated-options': {},
  'idp-okta-saml-claims': { scroll: 'identityProvider_buttonText', box: ['identityProvider_uniqueIdClaim', 'identityProvider_emailClaim'] },
  'idp-okta-saml-settings': { scroll: 'identityProvider_enabled', box: ['identityProvider_name', 'identityProvider_idpEndpoint', 'verification-keys', 'identityProvider_buttonText'] },
  'idp-samlv2-idp-initiated-add': {},
  'idp-samlv2-idp-initiated-add-options': {},
  'idp-external-jwt-claim-dialog': { claimDialog: true },
  'idp-external-jwt-domains': { scroll: 'identityProvider_enabled' },
  'idp-external-jwt-jwt': { scroll: 'identityProvider_debug' },
  'idp-external-jwt-oauth': { scroll: 'identityProvider_enabled' },
  'idp-discord-edit': { fill: { identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/discord.svg' } },
  'idp-discord-applications': {},
  'idp-discord-options': {},
  'idp-epic-add': {},
  'idp-nintendo-options': {},
  'idp-github-edit': { fill: { identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/github.svg' } },
  'idp-google-options': {},
  'idp-google-applications': { appRow: 'PiperChat' },
  'idp-google-tenants': { tenantConfig: true },
  'idp-apple-overrides': { overrides: piperChatId },
  'idp-linking-strategy': { listbox: 'identityProvider_linkingStrategy' },
  'idp-oidc-add': { fill: {
    identityProvider_name: 'Pied Piper', identityProvider_oauth2_client_id: '7a3906ee-b105-4ff9-bf9a-16df55c93f3f', identityProvider_oauth2_client_secret: '3uOQq-IxbZkh38KeI1AnoS9io5SnT3Np1vwqvGibWPs',
    identityProvider_oauth2_issuer: 'https://login.piedpiper.com', identityProvider_buttonText: 'Login with Pied Piper', identityProvider_oauth2_scope: 'openid',
  } },
  'idp-oidc-add-applications': {},
  'idp-oidc-add-domains': {},
  'idp-oidc-add-options': {},
  'idp-samlv2-add-domains': {},
  'idp-samlv2-add-options': { scroll: 'identityProvider_debug' },
  'idp-key-import-menu': { keyMenu: 'certificate' },
  'idp-key-import-certificate': { keyImport: { t: 'certificate' } },
  'idp-key-import-adfs': { keyImport: { t: 'certificate', name: 'ADFS Certificate', pem: idpSampleCertificate } },
  'idp-key-import-okta': { keyImport: { t: 'certificate', name: 'Pied Piper Okta IdP', pem: idpSampleCertificate }, box: ['key_name', 'key-pem'] },
  'idp-apple-import-key': { keyImport: { t: 'ec-private', name: 'Apple Private Key', kid: 'GCAMV1X32LQ', pem: idpSampleEcKey } },
  'idp-cors-settings': { cors: 'https://piedpiper.okta.com', box: ['cors-allowed-origins'] },
  'idp-app-oauth': { scroll: 'application_oauthConfiguration_clientId' },
  'idp-app-login-url': { appView: piperChatId },
  'idp-samlv2-configuration': {},
  'idp-steam-configuration': {},
  'idp-nintendo-configuration': {},
  'idp-sony-configuration': {},
  'idp-twitch-configuration': {},
  'idp-xbox-configuration': {},
  'idp-facebook-configuration': {},
  'idp-google-configuration': {},
  'idp-twitter-configuration': {},
  'idp-linkedin-configuration': {},
  'idp-apple-configuration': {},
  'idp-external-jwt-configuration': {},
};

// resources for the authenticate users pages
const auth = {
  lockActionId: '00000000-0000-0000-0000-f30000000001',
  jaredId: '00000000-0000-0000-0000-f30000000002',
  laurieId: '00000000-0000-0000-0000-f30000000003',
  hooliAppId: '00000000-0000-0000-0000-f30000000004',
  tableauKeyId: '00000000-0000-0000-0000-f30000000005',
  apiKeyId: '00000000-0000-0000-0000-f30000000006',
  apiTypeId: '00000000-0000-0000-0000-f30000000007',
  salesforceAppId: '00000000-0000-0000-0000-f3000000000b',
  zendeskLambdaId: '00000000-0000-0000-0000-f3000000000c',
  zendeskKeyId: '00000000-0000-0000-0000-f3000000000d',
  emailTemplateId: '00000000-0000-0000-0000-f3000000000e',
  messageTemplateId: '00000000-0000-0000-0000-f3000000000f',
  samlAppId: '00000000-0000-0000-0000-f30000000010',
  samlKeyId: '00000000-0000-0000-0000-f30000000011',
  voiceMessengerId: '00000000-0000-0000-0000-f30000000012',
  tableauAppId: '00000000-0000-0000-0000-f30000000013',
  voiceTemplateId: '00000000-0000-0000-0000-f30000000014',
};
// Manage users and verification: a tenant with email, phone and registration verification gated, and its users
const manageId = n => `00000000-0000-0000-0000-f4${String(n).padStart(10, '0')}`;
const verification = {
  tenantId: manageId(1), appId: manageId(2), codeAppId: manageId(3),
  emailTemplateId: manageId(11), registrationTemplateId: manageId(12), phoneTemplateId: manageId(13),
  emailFieldId: manageId(21), phoneFieldId: manageId(22), emailFormId: manageId(31), phoneFormId: manageId(32),
  // email unverified, phone unverified, registration unverified, verified email, verified phone, both verified, email code, registration code
  users: {
    jared: [manageId(41), { email: 'jared@piedpiper.com', firstName: 'Jared', lastName: 'Dunn' }, { skipRegistrationVerification: true }],
    laurie: [manageId(42), { phoneNumber: '+15555552223', firstName: 'Laurie', lastName: 'Bream' }, { skipRegistrationVerification: true }],
    carla: [manageId(43), { email: 'carla@piedpiper.com', firstName: 'Carla', lastName: 'Walton' }, { skipVerification: true }],
    jack: [manageId(44), { email: 'jack@piedpiper.com', firstName: 'Jack', lastName: 'Barker' }, { skipVerification: true, skipRegistrationVerification: true }],
    ron: [manageId(45), { phoneNumber: '+15555550142', firstName: 'Ron', lastName: 'LaFlamme' }, { skipVerification: true, skipRegistrationVerification: true }],
    russ: [manageId(46), { email: 'russ@piedpiper.com', phoneNumber: '+15555550199', firstName: 'Russ', lastName: 'Hanneman' }, { skipVerification: true, skipRegistrationVerification: true }],
    peter: [manageId(47), { email: 'peter@piedpiper.com', firstName: 'Peter', lastName: 'Gregory' }, { skipRegistrationVerification: true }],
    ed: [manageId(48), { email: 'ed@piedpiper.com', firstName: 'Ed', lastName: 'Chen' }, { skipVerification: true }],
  },
};
const userActionsExample = {
  welcomeTemplateId: manageId(51), goodbyeTemplateId: manageId(52), paidReasonId: manageId(61), expiredReasonId: manageId(62), surveyActionId: manageId(72),
};
const adminFormsExample = { colorFieldId: manageId(81), backgroundFieldId: manageId(82), userFormId: manageId(83), registrationFormId: manageId(84) };
// form values set (not saved) for each screenshot: true/false for switches and radios, text for inputs and selects
const manageFields = {
  'manage-verification-tenant-email-settings': { tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_verificationStrategy: 'FormField' },
  'manage-verification-tenant-phone-settings': { tenant_emailConfiguration_verifyEmail: false },
  'manage-verification-email-template-right': { tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_unverified_behavior: 'Allow' },
  'manage-verification-email-template-wrong': {
    tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_unverified_behavior: 'Allow', tenant_emailConfiguration_verificationEmailTemplateId: verification.registrationTemplateId,
  },
  'manage-verification-registration-template-right': { application_unverified_behavior: 'Allow' },
  'manage-verification-registration-template-wrong': { application_unverified_behavior: 'Allow', application_verificationEmailTemplateId: verification.emailTemplateId },
  'manage-verification-application-registration-delete': {
    application_unverified_behavior: 'Allow', application_registrationDeletePolicy_unverified_enabled: true, application_registrationDeletePolicy_unverified_numberOfDaysToRetain: '2',
    'application_registrationConfiguration_loginIdType-phoneNumber': true, application_registrationConfiguration_confirmPassword: true,
  },
  'manage-verification-application-self-service-phone': { 'application_registrationConfiguration_loginIdType-phoneNumber': true },
  'manage-pre-verification-tenant-email': { tenant_phoneConfiguration_verifyPhoneNumber: false, tenant_emailConfiguration_unverified_allowEmailChangeWhenGated: true },
  'manage-pre-verification-tenant-phone': {
    tenant_emailConfiguration_verifyEmail: false, tenant_phoneConfiguration_verificationStrategy: 'ClickableLink', tenant_phoneConfiguration_unverified_allowPhoneNumberChangeWhenGated: true,
  },
  'manage-pre-verification-application-email-form': {
    application_verifyRegistration: false, 'application_registrationConfiguration_type-advanced': true, application_registrationConfiguration_formId: verification.emailFormId,
  },
  'manage-pre-verification-application-phone-form': {
    application_verifyRegistration: false, 'application_registrationConfiguration_type-advanced': true, application_registrationConfiguration_formId: verification.phoneFormId,
  },
  'manage-pre-verification-field-email': { field_name: 'Email address', field_key: 'user.email', field_required: true },
  'manage-pre-verification-field-phone': { field_name: 'Phone number', field_key: 'user.phoneNumber', field_required: true },
  'manage-pre-verification-twilio-messenger': {
    messenger_name: 'Twilio Example', messenger_url: 'https://api.twilio.com', messenger_accountSID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    messenger_authToken: '2dacc9b0317671b0b9dacc9b0317671b', messenger_fromPhoneNumber: '+18559728742',
  },
  'manage-user-actions-tenant-smtp': { tenant_emailConfiguration_host: 'host.docker.internal', tenant_emailConfiguration_port: '1025' },
  'manage-user-actions-application-add': { applicationId: manageId(101), application_name: 'PiedPiper' },
  'manage-user-actions-application-oauth': {
    applicationId: manageId(101), application_name: 'PiedPiper', application_oauthConfiguration_logoutURL: 'http://localhost:3000/logout',
  },
  'manage-user-actions-api-key': { apiKeyId: manageId(102), apiKey_key: 'FTQkSoanK7ObbNjOoU69WDVclfTx8L_zfEJbdR8M0xu-jKotV0iQZiQh' },
  'manage-user-actions-welcome-template': { emailTemplateId: manageId(103), emailTemplate_name: 'Welcome', emailTemplate_defaultSubject: 'Welcome' },
  'manage-user-actions-webhook-add': { webhookId: manageId(104), webhook_url: 'http://host.docker.internal:3000/intercom', "webhook_eventsEnabled['UserAction']": true },
  'manage-user-actions-subscribe-action': {
    userAction_id: manageId(105), userAction_name: 'Subscribe', userAction_temporal: true, userAction_sendEndEvent: true,
    userAction_userEmailingEnabled: true, userAction_includeEmailInEventJSON: true, userAction_startEmailTemplateId: userActionsExample.welcomeTemplateId,
    userAction_modifyEmailTemplateId: userActionsExample.goodbyeTemplateId, userAction_cancelEmailTemplateId: userActionsExample.goodbyeTemplateId,
    userAction_endEmailTemplateId: userActionsExample.goodbyeTemplateId,
  },
  'manage-cleanspeak-integration': {
    integrations_cleanspeak_enabled: true, integrations_cleanspeak_url: 'http://localhost:8001', integrations_cleanspeak_apiKey: 'b44395a7-e5a8-4a41-b73a-364576277c0d',
    integrations_cleanspeak_usernameModeration_enabled: true,
  },
};
// hosted login pages, signed in as these users
const manageLogins = {
  'manage-verification-email-gate-link': 'jared@piedpiper.com', 'manage-verification-email-gate-code': 'peter@piedpiper.com', 'manage-verification-phone-gate': '+15555552223',
  'manage-verification-registration-gate-link': 'carla@piedpiper.com', 'manage-verification-registration-gate-code': 'ed@piedpiper.com', 'manage-user-actions-locked-account': 'gavin@hooli.com',
};
const extractedCode = file => readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'extractedcode', file), 'utf-8');
// Register users and user support.
const registerIds = {
  app: '00000000-0000-0000-0000-f50000000001',
  basic: '00000000-0000-0000-0000-f50000000002',
  form: '00000000-0000-0000-0000-f50000000003',
  first: '00000000-0000-0000-0000-f50000000004',
  adminUser: '00000000-0000-0000-0000-f50000000005',
  adminRegistration: '00000000-0000-0000-0000-f50000000006',
  locale: '00000000-0000-0000-0000-f50000000007',
  theme: '00000000-0000-0000-0000-f50000000008',
  user: '00000000-0000-0000-0000-f50000000009',
  manager: '00000000-0000-0000-0000-f5000000000a',
};
const registerNames = Object.keys(fixedHeight).filter(name => name.startsWith('register-'));
const registerFields = [
  '00000000-0000-0000-0000-f5000000000b',
  '00000000-0000-0000-0000-f5000000000c',
  '00000000-0000-0000-0000-f5000000000d',
  '00000000-0000-0000-0000-f5000000000e',
  '00000000-0000-0000-0000-f5000000000f',
  '00000000-0000-0000-0000-f50000000010',
];
let registerCookies;

// created for the screenshots that need them and deleted before any other, so other pages don't list them
const temporaryResources = [
  {
    names: ['five-minute-application-form', 'five-minute-application-details', 'five-minute-user-search', 'five-minute-registration-add', 'five-minute-login', 'five-minute-login-not-registered'],
    paths: [`/api/application/${exampleAppId}`],
    create: async api => {
      await api(`/api/application/${exampleAppId}`, 'POST', { application: { name: 'Example app', oauthConfiguration: {
        authorizedRedirectURLs: ['http://localhost:3000/oauth-redirect'], logoutURL: 'http://localhost:3000/logout',
        enabledGrants: ['authorization_code', 'refresh_token'], requireRegistration: true,
      } } });
    },
  },
  {
    names: ['multi-tenant-users'],
    paths: [`/api/tenant/${blueprintTenantId}`],
    create: async api => {
      await api(`/api/tenant/${blueprintTenantId}`, 'POST', { sourceTenantId: '30663132-6464-6665-3032-326466613934', tenant: { name: 'ppvctest2' } });
      await api('/api/user', 'POST', { user: { email: 'jianyang@octhulu.com', password: 'password', firstName: 'Jian', lastName: 'Yang' } }, { 'X-FusionAuth-TenantId': blueprintTenantId });
    },
  },
  {
    names: ['hierarchy-entity-types', 'hierarchy-entities', 'hierarchy-user-grant'],
    paths: [
      ...Object.values(hierarchy.entities).map(([, id]) => `/api/entity/${id}`),
      ...Object.values(hierarchy.types).map(id => `/api/entity/type/${id}`),
    ],
    create: async api => {
      for (const [name, id] of Object.entries(hierarchy.types)) {
        const permissions = (name === 'Document' ? ['Read', 'Write'] : ['Read', 'Write', 'IsMember']).map(p => ({ name: p }));
        await api(`/api/entity/type/${id}`, 'POST', { entityType: { name, permissions } });
      }
      for (const [name, [type, id]] of Object.entries(hierarchy.entities)) {
        await api(`/api/entity/${id}`, 'POST', { entity: { name, type: { id: hierarchy.types[type] } } });
      }
      const entityId = name => hierarchy.entities[name][1];
      for (const [name, parent, permissions] of hierarchy.grants) {
        await api(`/api/entity/${entityId(parent)}/grant`, 'POST', { grant: { recipientEntityId: entityId(name), permissions } });
      }
      await api(`/api/entity/${entityId('Change Bank Operations')}/grant`, 'POST', { grant: { userId: '00000000-0000-0000-0000-100000000001', permissions: ['Read', 'Write', 'IsMember'] } });
    },
  },
  {
    names: ['lambda-updated', 'lambda-edit-application'],
    paths: [`/api/lambda/${atestLambdaId}`],
    create: async api => {
      await api(`/api/lambda/${atestLambdaId}`, 'POST', { lambda: { name: '[ATest]', type: 'JWTPopulate', engineType: 'GraalJS', debug: true, body: atestBody('Goodbye') } });
    },
  },
  {
    names: ['lambda-registration-form', 'lambda-registration-messages', 'lambda-registration-blank', 'lambda-registration-invalid'],
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
      const body = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src/content/docs/extend/code/lambdas/self-service-registration.mdx'), 'utf-8')
        .match(/```javascript\n(\/\/ Validate the self-service registration form here[\s\S]*?)```/)[1];
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
  },
  // migrate users section
  {
    names: migrationTenantShots,
    paths: [`/api/tenant/${migration.importTenantId}`, `/api/application/${migration.importAppId}`],
    create: async api => {
      const headers = { 'X-FusionAuth-TenantId': migration.importTenantId };
      await api(`/api/tenant/${migration.importTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Import test' } });
      await api(`/api/application/${migration.importAppId}`, 'POST', { application: { name: 'Import test application', oauthConfiguration: {
        authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code', 'refresh_token'], clientSecret: 'import-test-secret-not-for-production',
      } } }, headers);
      for (const [id, email, firstName, lastName] of migration.importUsers) {
        await api(`/api/user/${id}`, 'POST', { user: { email, firstName, lastName, password: 'password' }, skipVerification: true }, headers);
        await api(`/api/user/registration/${id}`, 'POST', { registration: { applicationId: migration.importAppId } }, headers);
      }
    },
  },
  {
    names: ['migration-add-connector-policy', 'migration-delete-connector-policy'],
    paths: [`/api/tenant/${migration.policyTenantId}`],
    create: async api => {
      await api(`/api/tenant/${migration.policyTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper migration' } });
    },
  },
  {
    names: migrationConnectorShots,
    paths: [`/api/tenant/${migration.connectorTenantId}`, `/api/connector/${migration.ldapConnectorId}`, `/api/connector/${migration.genericConnectorId}`, `/api/lambda/${migration.reconcileLambdaId}`],
    create: async api => {
      await api(`/api/lambda/${migration.reconcileLambdaId}`, 'POST', { lambda: { name: 'Active Directory reconcile', type: 'LDAPConnectorReconcile', engineType: 'GraalJS',
        body: 'function reconcile(user, userAttributes) {\n  user.email = userAttributes.mail;\n}' } });
      await api(`/api/connector/${migration.ldapConnectorId}`, 'POST', { connector: {
        type: 'LDAP', name: 'Active Directory', authenticationURL: 'ldaps://ldap.piedpiper.com:636', securityMethod: 'LDAPS', connectTimeout: 1000, readTimeout: 2000,
        baseStructure: 'dc=piedpiper,dc=com', systemAccountDN: 'cn=fusionauth,ou=system,dc=piedpiper,dc=com', systemAccountPassword: 'not-a-secret',
        loginIdAttribute: 'mail', identifyingAttribute: 'uid', requestedAttributes: ['cn', 'givenName', 'sn', 'mail', 'uid'],
        lambdaConfiguration: { reconcileId: migration.reconcileLambdaId },
      } });
      await api(`/api/connector/${migration.genericConnectorId}`, 'POST', { connector: {
        type: 'Generic', name: 'Legacy User API', authenticationURL: 'https://api.piedpiper.com/legacy/login', connectTimeout: 1000, readTimeout: 2000,
      } });
      await api(`/api/tenant/${migration.connectorTenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper' } });
      const { tenant } = await api(`/api/tenant/${migration.connectorTenantId}`);
      await api(`/api/tenant/${migration.connectorTenantId}`, 'PUT', { tenant: { ...tenant, connectorPolicies: [
        { connectorId: migration.ldapConnectorId, domains: ['example.com'], migrate: false },
        { connectorId: migration.genericConnectorId, domains: ['*'], migrate: true },
        { connectorId: 'e3306678-a53a-4964-9040-1c96f36dda72', domains: ['*'], migrate: false },
      ] } });
    },
  },
  ...Object.entries(migration.providers).map(([key, provider]) => ({
    names: [`migration-${key}-connector-policy`, `migration-${key}-connector-added`],
    paths: [...(!provider.importTenant ? [`/api/tenant/${provider.tenantId}`] : []), `/api/connector/${provider.connectorId}`],
    create: async api => {
      await api(`/api/connector/${provider.connectorId}`, 'POST', { connector: {
        type: 'Generic', name: provider.name, authenticationURL: provider.authenticationURL, connectTimeout: provider.timeout ?? 1000, readTimeout: provider.timeout ?? 2000,
        debug: !!provider.debug, headers: provider.header && { [provider.header[0]]: provider.header[1] },
      } });
      if (!provider.importTenant) await api(`/api/tenant/${provider.tenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper migration' } });
    },
  })),
  {
    names: ['migration-passportjs-idp'],
    paths: [`/api/identity-provider/${migration.googleIdpId}`],
    create: async api => {
      await api(`/api/identity-provider/${migration.googleIdpId}`, 'POST', { identityProvider: {
        type: 'Google', name: 'Google', enabled: true, client_id: 'piedpiper.apps.googleusercontent.com', client_secret: 'not-a-secret', buttonText: 'Login with Google', scope: 'profile email',
      } });
    },
  },
  {
    names: ['migration-example-users'],
    paths: migration.exampleUsers.map(([id]) => `/api/user/${id}?hardDelete=true`),
    create: async api => {
      for (const [id, email, firstName, lastName] of migration.exampleUsers) {
        await api(`/api/user/${id}`, 'POST', { user: { email, firstName, lastName, password: 'password' }, skipVerification: true });
      }
    },
  },
  {
    names: migrationScimShots,
    paths: [
      `/api/entity/${migration.scim.clientId}`, `/api/entity/${migration.scim.serverId}`, `/api/user/${migration.scim.userId}?hardDelete=true`,
      `/api/entity/type/${migration.scim.clientTypeId}`, `/api/entity/type/${migration.scim.serverTypeId}`,
    ],
    create: async api => {
      const permissions = ['enterprise:user:create', 'enterprise:user:delete', 'enterprise:user:read', 'enterprise:user:update', 'group:create', 'group:delete', 'group:read',
        'group:update', 'resource-types:read', 'schemas:read', 'service-provider-config:read', 'user:create', 'user:delete', 'user:read', 'user:update'];
      await api(`/api/entity/type/${migration.scim.serverTypeId}`, 'POST', { entityType: { name: 'SCIM Server', permissions: permissions.map(p => ({ name: `scim:${p}` })) } });
      await api(`/api/entity/type/${migration.scim.clientTypeId}`, 'POST', { entityType: { name: 'SCIM Client' } });
      await api(`/api/entity/${migration.scim.serverId}`, 'POST', { entity: { name: 'SCIM Server for Default Tenant', type: { id: migration.scim.serverTypeId },
        clientId: migration.scim.serverId, clientSecret: 'scim-server-secret-not-for-production' } });
      await api(`/api/entity/${migration.scim.clientId}`, 'POST', { entity: { name: 'SCIM Client for SCIM-SDK Client App', type: { id: migration.scim.clientTypeId },
        clientId: migration.scim.clientId, clientSecret: 'i2kNQKFBPKKJ3FsnFiPYDOrvBUslrz5l-270kQRYQMI' } });
      await api(`/api/user/${migration.scim.userId}`, 'POST', { user: { username: 'test@example.com', email: 'test@example.com', password: 'password' }, skipVerification: true });
    },
  },
  {
    names: Object.keys(idpShots),
    // the IdPs first, since they use the applications and keys
    paths: [
      ...Object.keys(idpDefinitions).map(n => `/api/identity-provider/${idpId(n)}`),
      `/api/application/${piperChatId}`, `/api/application/${piperNetId}`,
      ...idpKeys.map(([n]) => `/api/key/${idpId(n)}`),
    ],
    create: async api => {
      for (const [n, name, algorithm] of idpKeys) {
        await api(`/api/key/generate/${idpId(n)}`, 'POST', { key: { name, algorithm, ...(algorithm === 'RS256' ? { length: 2048 } : {}) } });
      }
      await api(`/api/application/${piperChatId}`, 'POST', { application: { name: 'PiperChat', oauthConfiguration: {
        clientSecret: 'piperchat-client-secret-for-screenshots',
        authorizedRedirectURLs: ['https://piperchat.piedpiper.com/oauth-redirect'], enabledGrants: ['authorization_code', 'refresh_token'], generateRefreshTokens: true,
      } } });
      await api(`/api/application/${piperNetId}`, 'POST', { application: { name: 'PiperNet', oauthConfiguration: {
        authorizedRedirectURLs: ['https://pipernet.piedpiper.com/oauth-redirect'], enabledGrants: ['authorization_code'],
      } } });
      // created last, so the first path only exists once everything does
      for (const [n, identityProvider] of Object.entries(idpDefinitions).reverse()) {
        await api(`/api/identity-provider/${idpId(n)}`, 'POST', { identityProvider });
      }
    },
  },
  {
    names: ['authenticate-account-lock-user-action', 'authenticate-account-lock-tenant-settings', 'authenticate-account-lock-user-view', 'authenticate-account-lock-admin-view'],
    // without hardDelete a user or user action is only deactivated
    paths: [`/api/user/${auth.jaredId}?hardDelete=true`, `/api/user-action/${auth.lockActionId}?hardDelete=true`],
    create: async api => {
      await api(`/api/user-action/${auth.lockActionId}`, 'POST', { userAction: { name: 'Account Lock', temporal: true, preventLogin: true, sendEndEvent: true } });
      await api(`/api/user/${auth.jaredId}`, 'POST', { user: { email: 'jared@piedpiper.com', password: 'password', firstName: 'Jared', lastName: 'Dunn' } });
      await api('/api/user/action', 'POST', { broadcast: false, action: {
        actioneeUserId: auth.jaredId, actionerUserId: '00000000-0000-0000-0000-100000000001', userActionId: auth.lockActionId,
        comment: 'Failed login attempts exceeded', expiry: Date.now() + 3 * 60000,
      } });
    },
  },
  {
    names: ['authenticate-aiven-user-registrations'],
    paths: [`/api/user/${auth.laurieId}?hardDelete=true`],
    create: async api => {
      await api(`/api/user/${auth.laurieId}`, 'POST', { user: { email: 'laurie@raviga.com', username: 'laurie', password: 'password', firstName: 'Laurie', lastName: 'Bream' } });
    },
  },
  {
    names: ['authenticate-user-registrations-sso'],
    paths: [`/api/application/${auth.hooliAppId}`],
    create: async api => {
      await api(`/api/application/${auth.hooliAppId}`, 'POST', { application: { name: 'Hooli', oauthConfiguration: {
        authorizedRedirectURLs: ['http://hooli.local:3001/oauth-redirect'], logoutURL: 'http://hooli.local:3001/endsession', enabledGrants: ['authorization_code', 'refresh_token'],
      } } });
      await api('/api/user/registration/00000000-0000-0000-0000-100000000004', 'POST', { registration: { applicationId: auth.hooliAppId } });
    },
  },
  {
    names: ['authenticate-tableau-application-jwt', 'authenticate-cockroachdb-application-jwt'],
    paths: [`/api/key/${auth.tableauKeyId}`],
    create: async (api, name) => {
      await api(`/api/key/generate/${auth.tableauKeyId}`, 'POST', { key: { algorithm: 'RS256', name: name.includes('cockroachdb') ? 'CockroachDB RS256 Key' : 'Tableau RS256 Key', length: 2048 } });
    },
  },
  {
    names: ['authenticate-entity-add-email-api'],
    paths: [`/api/entity/type/${auth.apiTypeId}`],
    create: async api => {
      await api(`/api/entity/type/${auth.apiTypeId}`, 'POST', { entityType: { name: 'API', permissions: [{ name: 'read' }, { name: 'write' }] } });
    },
  },
  {
    names: ['authenticate-salesforce-application-oauth'],
    paths: [`/api/application/${auth.salesforceAppId}`],
    create: async api => {
      await api(`/api/application/${auth.salesforceAppId}`, 'POST', { application: { name: 'Salesforce', oauthConfiguration: {
        clientSecret: 'salesforce-secret-not-for-production', enabledGrants: ['authorization_code', 'refresh_token'],
        authorizedRedirectURLs: ['https://your-application.my.salesforce.com/services/authcallback/FusionAuth'],
        logoutURL: 'https://your-application.my.salesforce.com/services/auth/rp/oidc/logout',
      } } });
    },
  },
  {
    names: ['authenticate-zendesk-application-saml'],
    paths: [`/api/lambda/${auth.zendeskLambdaId}`],
    create: async api => {
      const body = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src/content/docs/lifecycle/authenticate-users/integrations/saml/zendesk.mdx'), 'utf-8')
        .match(/```javascript\n(function populate[\s\S]*?)```/)[1];
      await api(`/api/lambda/${auth.zendeskLambdaId}`, 'POST', { lambda: { name: 'Populate Zendesk roles', type: 'SAMLv2Populate', engineType: 'GraalJS', body } });
    },
  },
  {
    // an imported certificate, so the fingerprints are the same on every run
    names: ['authenticate-zendesk-key-fingerprint'],
    paths: [`/api/key/${auth.zendeskKeyId}`],
    create: async api => {
      const certificate = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'screenshots/keys/zendesk-signing.crt'), 'utf-8');
      await api(`/api/key/import/${auth.zendeskKeyId}`, 'POST', { key: { name: 'SAML key generated for application Zendesk', certificate } });
    },
  },
  {
    names: ['authenticate-application-saml-view-dialog', 'authenticate-tableau-cloud-metadata-url', 'authenticate-sendgrid-saml-details', 'authenticate-sendgrid-metadata'],
    paths: [`/api/application/${auth.samlAppId}`, `/api/key/${auth.samlKeyId}`],
    create: async (api, name) => {
      const asset = file => readFileSync(join(dirname(fileURLToPath(import.meta.url)), `screenshots/keys/${file}`), 'utf-8');
      await api(`/api/key/import/${auth.samlKeyId}`, 'POST', { key: { name: 'Pied Piper demonstration SAML key', algorithm: 'RS256', privateKey: asset('saml-demo.key'), certificate: asset('saml-demo.crt') } });
      await api(`/api/application/${auth.samlAppId}`, 'POST', { application: {
        name: name.includes('sendgrid') ? 'SendGrid' : name.includes('tableau') ? 'Tableau' : 'Pied Piper SAML',
        samlv2Configuration: { enabled: true, issuer: 'https://piedpiper.com', keyId: auth.samlKeyId, authorizedRedirectURLs: ['https://piedpiper.com/saml/acs'] },
      } });
    },
  },
  {
    names: ['authenticate-tableau-application-details'],
    paths: [`/api/application/${auth.tableauAppId}`],
    create: async api => {
      await api(`/api/application/${auth.tableauAppId}`, 'POST', { application: { name: 'Tableau Cloud OIDC', oauthConfiguration: { clientSecret: 'tableau-secret-not-for-production', enabledGrants: ['authorization_code', 'refresh_token'] } } });
    },
  },
  // Manage users and verification
  {
    names: [
      'manage-verification-tenant-email-settings', 'manage-verification-email-template', 'manage-verification-application-self-service', 'manage-verification-application-details',
      'manage-verification-email-gate-link', 'manage-verification-email-unverified-user', 'manage-verification-email-gate-code', 'manage-verification-tenant-messenger',
      'manage-verification-tenant-phone-settings', 'manage-verification-phone-template', 'manage-verification-application-self-service-phone', 'manage-verification-phone-gate',
      'manage-verification-phone-unverified-user', 'manage-verification-application-registration-settings', 'manage-verification-registration-template',
      'manage-verification-registration-gate-link', 'manage-verification-registration-unverified-user', 'manage-verification-registration-gate-code',
      'manage-verification-application-registration-delete', 'manage-verification-verified-user', 'manage-verification-email-template-right', 'manage-verification-email-template-wrong',
      'manage-verification-registration-template-right', 'manage-verification-registration-template-wrong', 'manage-pre-verification-tenant-email', 'manage-pre-verification-form-email',
      'manage-pre-verification-application-email-form', 'manage-pre-verification-application-details', 'manage-pre-verification-user-email-verified', 'manage-pre-verification-tenant-phone',
      'manage-pre-verification-form-phone', 'manage-pre-verification-application-phone-form', 'manage-pre-verification-user-phone-verified', 'manage-pre-verification-user-email-phone-verified',
    ],
    // deleting the tenant deletes its applications and users
    paths: [
      `/api/tenant/${verification.tenantId}`, `/api/form/${verification.emailFormId}`, `/api/form/${verification.phoneFormId}`,
      `/api/form/field/${verification.emailFieldId}`, `/api/form/field/${verification.phoneFieldId}`, `/api/email/template/${verification.emailTemplateId}`,
      `/api/email/template/${verification.registrationTemplateId}`, `/api/message/template/${verification.phoneTemplateId}`,
    ],
    create: async api => {
      const v = verification;
      const template = (name, subject, file) => ({ emailTemplate: { name, defaultSubject: subject, defaultFromName: 'Pied Piper', fromEmail: 'jared@piedpiper.com',
        defaultHtmlTemplate: extractedCode(`templates-email/${file}.html.ftl`), defaultTextTemplate: extractedCode(`templates-email/${file}.txt.ftl`) } });
      await api(`/api/email/template/${v.emailTemplateId}`, 'POST', template('Email Verification', 'Verify your Pied Piper email address', 'email-verification'));
      await api(`/api/email/template/${v.registrationTemplateId}`, 'POST', template('Registration Verification', 'Verify your PiperChat registration', 'registration-verification'));
      await api(`/api/message/template/${v.phoneTemplateId}`, 'POST', { messageTemplate: { name: 'Phone Verification', type: 'SMS', defaultTemplate: extractedCode('templates-messengers/phone-verification.txt.ftl') } });
      await api(`/api/tenant/${v.tenantId}`, 'POST', { sourceTenantId: defaultTenantId, tenant: { name: 'Pied Piper' } });
      // a copied tenant ignores the rest of the body
      await api(`/api/tenant/${v.tenantId}`, 'PATCH', { tenant: {
        emailConfiguration: { verifyEmail: true, verificationEmailTemplateId: v.emailTemplateId, verificationStrategy: 'ClickableLink', unverified: { behavior: 'Gated' } },
        phoneConfiguration: { messengerId: '00000000-0000-0000-0000-500000000001', verifyPhoneNumber: true, verificationTemplateId: v.phoneTemplateId, verificationStrategy: 'FormField', unverified: { behavior: 'Gated' } },
      } });
      const inTenant = { 'X-FusionAuth-TenantId': v.tenantId };
      const app = (name, strategy) => ({ application: { name,
        oauthConfiguration: { authorizedRedirectURLs: ['https://example.com'], enabledGrants: ['authorization_code', 'refresh_token'] },
        registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email' },
        verifyRegistration: true, verificationEmailTemplateId: v.registrationTemplateId, verificationStrategy: strategy, unverified: { behavior: 'Gated' },
      } });
      await api(`/api/application/${v.appId}`, 'POST', app('PiperChat', 'ClickableLink'), inTenant);
      await api(`/api/application/${v.codeAppId}`, 'POST', app('Not-Hotdog', 'FormField'), inTenant);
      await api(`/api/form/field/${v.emailFieldId}`, 'POST', { field: { key: 'user.email', name: 'Email address', control: 'text', type: 'email', required: true } });
      await api(`/api/form/field/${v.phoneFieldId}`, 'POST', { field: { key: 'user.phoneNumber', name: 'Phone number', control: 'text', type: 'phoneNumber', required: true } });
      // the built-in Password field gets a new id on each install
      const password = (await api('/api/form/field')).fields.find(f => f.name === 'Password').id;
      for (const [formId, name, fieldId, type] of [[v.emailFormId, 'Email verification', v.emailFieldId, 'verifyEmail'], [v.phoneFormId, 'Phone verification', v.phoneFieldId, 'verifyPhoneNumber']]) {
        await api(`/api/form/${formId}`, 'POST', { form: { name, type: 'registration', steps: [{ fields: [fieldId] }, { type, fields: [] }, { fields: [password] }] } });
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      for (const [name, [userId, user, options]] of Object.entries(v.users)) {
        await api(`/api/user/registration/${userId}`, 'POST', {
          user: { password: 'password', ...user }, registration: { applicationId: name === 'ed' ? v.codeAppId : v.appId }, sendSetPasswordEmail: false, ...options,
        }, inTenant);
      }
      // Skipping exempts an identity from gating; completing it supplies the verified indicator.
      for (const [, user, options] of Object.values(v.users)) {
        if (!options.skipVerification) continue;
        for (const [loginIdType, loginId] of [['email', user.email], ['phoneNumber', user.phoneNumber]]) {
          if (!loginId) continue;
          const { verificationId } = await api('/api/identity/verify/start', 'POST', { loginId, loginIdType, verificationStrategy: 'ClickableLink' }, inTenant);
          await api('/api/identity/verify/complete', 'POST', { verificationId }, inTenant);
        }
      }
    },
  },
  {
    names: ['manage-user-actions-subscribe-action', 'manage-user-actions-reasons', 'manage-user-actions-survey-action'],
    paths: [
      `/api/user-action/${userActionsExample.surveyActionId}`, `/api/user-action-reason/${userActionsExample.paidReasonId}`, `/api/user-action-reason/${userActionsExample.expiredReasonId}`,
      `/api/email/template/${userActionsExample.welcomeTemplateId}`, `/api/email/template/${userActionsExample.goodbyeTemplateId}`,
    ],
    create: async api => {
      const u = userActionsExample;
      await api(`/api/user-action/${u.surveyActionId}`, 'POST', { userAction: { name: 'Survey', options: [['Good', 'Bona'], ['Neutral', 'Meza'], ['Bad', 'Malbona']].map(([name, eo]) => ({ name, localizedNames: { eo } })) } });
      await api(`/api/user-action-reason/${u.paidReasonId}`, 'POST', { userActionReason: { text: 'Paid Subscription', code: 'PS' } });
      await api(`/api/user-action-reason/${u.expiredReasonId}`, 'POST', { userActionReason: { text: 'Expired Subscription', code: 'ES' } });
      const body = text => ({ defaultHtmlTemplate: text, defaultTextTemplate: text });
      await api(`/api/email/template/${u.welcomeTemplateId}`, 'POST', { emailTemplate: { name: 'Welcome', defaultSubject: 'Welcome', ...body('Welcome to PiedPiper. Your subscription is valid for one month of reading.') } });
      await api(`/api/email/template/${u.goodbyeTemplateId}`, 'POST', { emailTemplate: { name: 'Goodbye', defaultSubject: 'Goodbye', ...body('Your subscription has expired and you may no longer read the news. Goodbye.') } });
    },
  },
  // Register users and user support.
  {
    names: registerNames,
    paths: [
      `/api/application/${registerIds.app}`, `/api/application/${registerIds.basic}`,
      `/api/user/${registerIds.user}?hardDelete=true`, `/api/user/${registerIds.manager}?hardDelete=true`,
      ...['form', 'first', 'adminUser', 'adminRegistration', 'locale'].map(k => `/api/form/${registerIds[k]}`),
      ...registerFields.map(id => `/api/form/field/${id}`), `/api/theme/${registerIds.theme}`,
    ],
    create: async api => {
      const r = registerIds;
      const definitions = [
        { name: 'Minimum Price', key: 'registration.data.minprice', control: 'number', type: 'number', required: true },
        { name: 'Maximum Price', key: 'registration.data.maxprice', control: 'number', type: 'number', required: true },
        { name: 'Geographic Area', key: 'registration.data.geographicarea', control: 'text', type: 'string' },
        { name: 'User notes', key: 'user.data.notes', control: 'textarea', type: 'string' },
        { name: 'My hidden field', key: 'user.data.answer', control: 'text', type: 'string' },
        { name: 'Preferred languages', key: 'user.preferredLanguages', control: 'select', type: 'string', options: ['en', 'fr', 'es'] },
      ];
      for (const [i, field] of definitions.entries()) await api(`/api/form/field/${registerFields[i]}`, 'POST', { field });
      const { fields } = await api('/api/form/field');
      const builtin = name => {
        const field = fields.find(f => f.name === name);
        if (!field) throw new Error(`Missing built-in field: ${name}`);
        return field.id;
      };
      const identity = ['First name', 'Email', 'Password', 'Mobile phone'].map(builtin);
      const custom = [registerFields[2], registerFields[0], registerFields[1]];
      const forms = [
        ['form', 'Real estate search registration form', 'registration', [{ fields: identity }, { fields: custom }]],
        ['first', 'Real estate search first step', 'registration', [{ fields: identity }]],
        ['adminUser', 'Real estate admin user form', 'adminUser', [{ fields: ['[Admin User] email', '[Admin User] first name', '[Admin User] mobile phone'].map(builtin).concat(registerFields[3]) }]],
        ['adminRegistration', 'Real estate admin registration form', 'adminRegistration', [{ fields: custom }]],
        ['locale', 'Capture preferred languages', 'registration', [{ fields: ['Email', 'Password'].map(builtin).concat(registerFields[5]) }]],
      ];
      for (const [key, name, type, steps] of forms) await api(`/api/form/${r[key]}`, 'POST', { form: { name, type, steps } });
      const { theme } = await api(`/api/theme/${defaultThemeId}`);
      await api(`/api/theme/${r.theme}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Real Estate Registration' } });
      await api(`/api/theme/${r.theme}`, 'PATCH', { theme: { defaultMessages: `${theme.defaultMessages}
user.firstName=Your first name
user.email=Email
user.password=Password
user.mobilePhone=Your mobile phone number
registration.data.minprice=Minimum price
registration.data.maxprice=Maximum price
registration.data.geographicarea=Geographic area
user.data.notes=User notes` } });
      const oauthConfiguration = { authorizedRedirectURLs: ['https://local.fusionauth.io/callback'], enabledGrants: ['authorization_code'] };
      await api(`/api/application/${r.app}`, 'POST', { application: { name: 'Pied Piper Real Estate', themeId: r.theme, oauthConfiguration,
        registrationConfiguration: { enabled: true, type: 'advanced', formId: r.form }, formConfiguration: { adminRegistrationFormId: r.adminRegistration } } });
      await api(`/api/application/${r.basic}`, 'POST', { application: { name: 'Pied Piper Registration', oauthConfiguration,
        registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email', confirmPassword: true,
          firstName: { enabled: true, required: true }, lastName: { enabled: true, required: false } } } });
      await api(`/api/user/registration/${r.user}`, 'POST', { user: { email: 'carla@piedpiper.com', firstName: 'Carla', lastName: 'Walton', password: 'password', mobilePhone: '+15555550112', data: { notes: 'Interested in a family home.' } },
        registration: { applicationId: r.app, data: { minprice: 500000, maxprice: 1000000, geographicarea: 'Near University' } } });
      await api(`/api/user/registration/${r.user}`, 'POST', { registration: { applicationId: '3c219e58-ed0e-4b18-ad48-f4f92793ae32', roles: ['user_manager'] } });
      await api(`/api/user/registration/${r.manager}`, 'POST', { user: { email: 'jared@piedpiper.com', firstName: 'Jared', lastName: 'Dunn', password: 'password' },
        registration: { applicationId: '3c219e58-ed0e-4b18-ad48-f4f92793ae32', roles: ['user_manager'] } });
    },
  },
];



const piedPiperAppId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const defaultTenantId = '30663132-6464-6665-3032-326466613934';
const richardId = '00000000-0000-0000-0000-100000000001';

const apiRequest = (path, method = 'GET', body) => fetch(`http://localhost:9011${path}`, {
  method, headers: { 'Authorization': 'screenshot-dev-key-not-for-production', 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
}).then(async r => {
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${text}`);
  return text ? JSON.parse(text) : null;
});

// the built-in form gets a new id on each install
const selfServiceFormId = async () => (await apiRequest('/api/form')).forms.find(f => f.name === 'Default User Self Service provided by FusionAuth').id;

// a fixed authenticator secret, so the QR code and the codes it makes are the same on every run
const totpSecret = Buffer.from('PiedPiperRocks!');
const totpSecretBase32 = [...totpSecret].map(b => b.toString(2).padStart(8, '0')).join('').match(/.{5}/g)
  .map(bits => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[parseInt(bits, 2)]).join('');
const totpCode = () => {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const digest = createHmac('sha1', totpSecret).update(counter).digest();
  const offset = digest.at(-1) & 0xf;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, '0');
};

// a recovery code is accepted in place of a method's code and removes every method
async function removeTwoFactor() {
  const { user } = await apiRequest(`/api/user/${richardId}`);
  const method = user.twoFactor?.methods?.[0];
  if (!method) return;
  const { recoveryCodes } = await apiRequest(`/api/user/two-factor/recovery-code/${richardId}`, 'POST');
  await apiRequest(`/api/user/two-factor/${richardId}`, 'DELETE', { methodId: method.id, code: recoveryCodes[0] });
}

const accountThemeId = '00000000-0000-0000-0000-300000000002';
const twoFactorTemplateIds = { email: '00000000-0000-0000-0000-400000000003', sms: '00000000-0000-0000-0000-400000000004' };

// changed for the screenshots that need it and changed back before any other; apply returns the undo
const temporaryState = [
  {
    names: ['account-not-registered'],
    apply: async () => {
      const { registration } = await apiRequest(`/api/user/registration/${richardId}/${piedPiperAppId}`);
      await apiRequest(`/api/user/registration/${richardId}/${piedPiperAppId}`, 'DELETE');
      return () => apiRequest(`/api/user/registration/${richardId}`, 'POST', { registration });
    },
  },
  {
    names: ['account-configuration-incomplete'],
    apply: async () => {
      const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
      const formId = application.formConfiguration.selfServiceFormId;
      delete application.formConfiguration.selfServiceFormId;
      await apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
      return () => apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { formConfiguration: { selfServiceFormId: formId } } });
    },
  },
  {
    names: ['account-tenant-mfa-email', 'account-tenant-mfa-phone', 'account-two-factor-email', 'account-two-factor-phone'],
    apply: async () => {
      const emailTemplate = `/api/email/template/${twoFactorTemplateIds.email}`, messageTemplate = `/api/message/template/${twoFactorTemplateIds.sms}`;
      await apiRequest(emailTemplate, 'POST', { emailTemplate: {
        name: 'Two Factor Authentication', defaultFromName: 'Pied Piper', defaultSubject: 'Your second factor code',
        defaultHtmlTemplate: '<p>Your verification code is ${code}</p>', defaultTextTemplate: 'Your verification code is ${code}',
      } });
      await apiRequest(messageTemplate, 'POST', { messageTemplate: { name: 'Default Two Factor Request', type: 'SMS', defaultTemplate: 'Your verification code is ${code}' } });
      const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { multiFactorConfiguration: {
        email: { enabled: true, templateId: twoFactorTemplateIds.email },
        sms: { enabled: true, messengerId: '00000000-0000-0000-0000-500000000001', templateId: twoFactorTemplateIds.sms },
      } } });
      return async () => {
        // a PUT clears the template ids, so the templates can be deleted
        await apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
        await apiRequest(emailTemplate, 'DELETE');
        await apiRequest(messageTemplate, 'DELETE');
      };
    },
  },
  {
    names: ['account-edit-birthdate', 'account-home-birthdate'],
    apply: async () => {
      const formId = await selfServiceFormId();
      const { form } = await apiRequest(`/api/form/${formId}`);
      const { fields } = await apiRequest('/api/form/field');
      const birthdate = fields.find(f => f.name === 'Birthdate').id;
      await apiRequest(`/api/form/${formId}`, 'PUT', { form: { ...form, steps: [{ fields: [...form.steps[0].fields, birthdate] }, ...form.steps.slice(1)] } });
      await apiRequest(`/api/user/${richardId}`, 'PATCH', { user: { birthDate: '1981-06-04' } });
      return async () => {
        await apiRequest(`/api/form/${formId}`, 'PUT', { form });
        await apiRequest(`/api/user/${richardId}`, 'PATCH', { user: { birthDate: null } });
      };
    },
  },
  {
    // the Account index template with the change from the guide
    names: ['account-home-birthdate'],
    apply: async () => {
      const change = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src/content/docs/lifecycle/manage-users/account-management/customizing-account-management.mdx'), 'utf-8')
        .match(/```ftl\n(<p>This is now modified[\s\S]*?)```/)[1];
      const { theme: source } = await apiRequest(`/api/theme/${defaultThemeId}`);
      const accountIndex = source.templates.accountIndex.replace(/(\n\s*<\/div>\n\n\s*\[#-- Edit button)/, `\n${change}$1`);
      await apiRequest(`/api/theme/${accountThemeId}`, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Account' } });
      await apiRequest(`/api/theme/${accountThemeId}`, 'PATCH', { theme: { templates: { accountIndex } } });
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: accountThemeId } });
      return async () => {
        await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: defaultThemeId } });
        await apiRequest(`/api/theme/${accountThemeId}`, 'DELETE');
      };
    },
  },
  {
    // enabled in the screenshot itself
    names: ['account-recovery-codes'],
    apply: async () => removeTwoFactor,
  },
  {
    names: ['account-two-factor-challenge'],
    apply: async () => {
      await apiRequest(`/api/user/two-factor/${richardId}`, 'POST', { method: 'authenticator', secret: totpSecret.toString('base64'), code: totpCode() });
      return removeTwoFactor;
    },
  },
  // migrate users section
  {
    names: ['migration-reset-user-password'],
    apply: async () => {
      const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
      const originalTemplateId = tenant.emailConfiguration.forgotPasswordEmailTemplateId;
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { emailConfiguration: { forgotPasswordEmailTemplateId: '00000000-0000-0000-0000-400000000001' } } });
      return () => apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { emailConfiguration: { forgotPasswordEmailTemplateId: originalTemplateId ?? null } } });
    },
  },
  {
    // the API can't add keys with the screenshot key, so the screenshot adds this one in the admin UI
    names: ['migration-api-key-details'],
    apply: async () => async () => {
      const page = await migration.context.newPage();
      await page.goto('http://localhost:9011/admin/api-key/', { waitUntil: 'networkidle' });
      await page.evaluate(id => {
        const link = document.querySelector(`main a[href="/ajax/api-key/delete/${id}"]`);
        link.closest('[popover]')?.showPopover();
        link.click();
      }, migration.apiKeyId);
      await page.locator('.prime-dialog.open button[type=submit]').click();
      await page.waitForLoadState('networkidle');
      await page.close();
    },
  },
  {
    names: ['authenticate-tenant-mfa-methods', 'authenticate-mfa-admin-add-method', 'authenticate-mfa-admin-one-method', 'authenticate-mfa-admin-two-methods', 'authenticate-mfa-admin-disable-method', 'authenticate-mfa-self-service-methods', 'authenticate-mfa-code-sent', 'authenticate-mfa-challenge-methods'],
    apply: async () => {
      const emailTemplate = `/api/email/template/${auth.emailTemplateId}`, messageTemplate = `/api/message/template/${auth.messageTemplateId}`;
      await apiRequest(emailTemplate, 'POST', { emailTemplate: {
        name: 'Two Factor Authentication', defaultFromName: 'Pied Piper', defaultSubject: 'Your second factor code',
        defaultHtmlTemplate: '<p>Your verification code is ${code}</p>', defaultTextTemplate: 'Your verification code is ${code}',
      } });
      await apiRequest(messageTemplate, 'POST', { messageTemplate: { name: 'Default Two Factor Request', type: 'SMS', defaultTemplate: 'Your verification code is ${code}' } });
      await apiRequest(`/api/message/template/${auth.voiceTemplateId}`, 'POST', { messageTemplate: { name: 'Pied Piper Voice MFA', type: 'Voice', defaultTemplate: 'Your verification code is ${code}' } });
      await apiRequest(`/api/messenger/${auth.voiceMessengerId}`, 'POST', { messenger: { name: 'Pied Piper voice', type: 'Generic', messageTypes: ['Voice'], url: 'http://sms-mock:8081/', connectTimeout: 2000, readTimeout: 2000 } });
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
  },
  ...[
    [['authenticate-mfa-admin-one-method'], ['email']],
    [['authenticate-mfa-code-sent'], ['sms']],
    [['authenticate-mfa-admin-two-methods', 'authenticate-mfa-admin-disable-method', 'authenticate-mfa-self-service-methods', 'authenticate-mfa-challenge-methods'], ['email', 'authenticator']],
  ].map(([names, methods]) => ({
    names,
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
  })),
  {
    names: ['authenticate-aiven-api-keys'],
    apply: async page => {
      await page.goto('http://localhost:9011/admin/api-key/add', { waitUntil: 'networkidle' });
      await page.fill('#apiKeyId', auth.apiKeyId);
      await page.fill('#apiKey_name', 'Certificate generator');
      await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'Certificate generator');
      await page.fill('#apiKey_key', 'certificate-generator-key-not-for-production-NKU5Ypg');
      await page.locator('#endpoints tr').filter({ hasText: /^\s*\/api\/key\/import\s/ }).locator('input[value=POST]').check();
      await page.locator('#save-button').click();
      await page.waitForURL(u => u.pathname === '/admin/api-key/');
      for (let i = 0; ; i++) {
        if (await page.locator('main tbody tr').filter({ hasText: 'Certificate generator' }).count()) break;
        if (i === 60) throw new Error('Certificate generator key did not appear');
        await page.waitForTimeout(500);
        await page.reload({ waitUntil: 'networkidle' });
      }
      return async () => {
        const cleanup = await page.context().newPage();
        try {
          await cleanup.goto('http://localhost:9011/admin/api-key/', { waitUntil: 'networkidle' });
          await cleanup.locator(`main a[href="/ajax/api-key/delete/${auth.apiKeyId}"]`).waitFor({ state: 'attached' });
          await cleanup.evaluate(id => {
            const link = [...document.querySelectorAll('a')].find(a => a.href.includes('/delete/') && a.href.includes(id));
            if (!link) throw new Error('API key delete link not found');
            link.closest('[popover]')?.showPopover();
            link.click();
          }, auth.apiKeyId);
          await cleanup.locator('.prime-dialog.open').waitFor();
          await cleanup.locator('.prime-dialog.open button').filter({ hasText: /Delete|Confirm/ }).first().click();
          await cleanup.locator('.prime-dialog.open').waitFor({ state: 'hidden' });
          await cleanup.waitForLoadState('networkidle');
        } finally { await cleanup.close(); }
      };
    },
  },
  ...[
    [['authenticate-oauth-consent'], { relationship: 'ThirdParty', consentMode: 'AlwaysPrompt', providedScopePolicy: { email: { enabled: true, required: true }, phone: { enabled: true, required: false } } }],
    [['authenticate-oauth-device-user-code'], { enabledGrants: ['authorization_code', 'refresh_token', 'urn:ietf:params:oauth:grant-type:device_code'], deviceVerificationURL: 'https://piedpiper.com/device' }],
  ].map(([names, oauthConfiguration]) => ({
    names,
    apply: async () => {
      const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
      await apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { oauthConfiguration } });
      return () => apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
    },
  })),
  // Manage users and verification
  {
    names: ['manage-user-actions-subscriber'],
    apply: async () => {
      const userId = '00000000-0000-0000-0000-100000000002';
      const roleId = manageId(106);
      const { registration } = await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`);
      await apiRequest(`/api/application/${piedPiperAppId}/role/${roleId}`, 'POST', { role: { name: 'customer' } });
      await new Promise(resolve => setTimeout(resolve, 5000));
      await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`, 'PUT', { registration: { ...registration, roles: ['customer'] }, skipRegistrationVerification: true });
      return async () => {
        await apiRequest(`/api/user/registration/${userId}/${piedPiperAppId}`, 'PUT', { registration, skipRegistrationVerification: true });
        await apiRequest(`/api/application/${piedPiperAppId}/role/${roleId}`, 'DELETE');
      };
    },
  },
  {
    // the email strategy is set for the whole tenant, which the verification resources above create
    names: ['manage-verification-email-gate-code'],
    apply: async () => {
      const tenant = `/api/tenant/${verification.tenantId}`, inTenant = { 'X-FusionAuth-TenantId': verification.tenantId };
      const strategy = verificationStrategy => apiRequest(tenant, 'PATCH', { tenant: { emailConfiguration: { verificationStrategy } } });
      await strategy('FormField');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await fetch(`http://localhost:9011/api/identity/verify/start`, {
        method: 'POST', headers: { 'Authorization': 'screenshot-dev-key-not-for-production', 'Content-Type': 'application/json', ...inTenant },
        body: JSON.stringify({ loginId: 'peter@piedpiper.com', loginIdType: 'email', verificationStrategy: 'FormField' }),
      }).then(async r => { if (!r.ok) throw new Error(`verify start: ${r.status} ${await r.text()}`); });
      return async () => {
        if ((await fetch(`http://localhost:9011${tenant}`, { headers: { 'Authorization': 'screenshot-dev-key-not-for-production' } })).ok) await strategy('ClickableLink');
      };
    },
  },
  {
    // custom admin user and registration forms with one custom field each, and Monica's values for them
    names: ['manage-admin-forms-user-form', 'manage-admin-forms-registration-form', 'manage-admin-forms-user-data'],
    apply: async () => {
      const f = adminFormsExample;
      await apiRequest(`/api/form/field/${f.colorFieldId}`, 'POST', { field: { key: 'user.data.favoriteColor', name: 'Favorite Color', control: 'text', type: 'string' } });
      await apiRequest(`/api/form/field/${f.backgroundFieldId}`, 'POST', { field: { key: 'registration.data.backgroundColor', name: 'Desired Background Color', control: 'text', type: 'string' } });
      const { forms } = await apiRequest('/api/form');
      const withField = (type, fieldId) => {
        const steps = structuredClone(forms.find(form => form.type === type && form.name.startsWith('Default')).steps);
        steps[0].fields.push(fieldId);
        return steps;
      };
      await apiRequest(`/api/form/${f.userFormId}`, 'POST', { form: { name: 'Custom Admin User', type: 'adminUser', steps: withField('adminUser', f.colorFieldId) } });
      await apiRequest(`/api/form/${f.registrationFormId}`, 'POST', { form: { name: 'Custom Admin Registration', type: 'adminRegistration', steps: withField('adminRegistration', f.backgroundFieldId) } });
      const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
      const { application } = await apiRequest(`/api/application/${piedPiperAppId}`);
      const { user } = await apiRequest(`/api/user/${monicaId}`);
      const { registration } = await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`);
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { formConfiguration: { adminUserFormId: f.userFormId } } });
      await apiRequest(`/api/application/${piedPiperAppId}`, 'PATCH', { application: { formConfiguration: { adminRegistrationFormId: f.registrationFormId } } });
      await apiRequest(`/api/user/${monicaId}`, 'PATCH', { user: { data: { company: 'PiedPiper', favoriteColor: 'red' } } });
      await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`, 'PATCH', { registration: { data: { backgroundColor: 'blue' } } });
      return async () => {
        await apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
        await apiRequest(`/api/application/${piedPiperAppId}`, 'PUT', { application });
        await apiRequest(`/api/user/${monicaId}`, 'PUT', { user, skipVerification: true });
        await apiRequest(`/api/user/registration/${monicaId}/${piedPiperAppId}`, 'PUT', { registration, skipRegistrationVerification: true });
        for (const path of [`/api/form/${f.userFormId}`, `/api/form/${f.registrationFormId}`, `/api/form/field/${f.colorFieldId}`, `/api/form/field/${f.backgroundFieldId}`]) {
          await apiRequest(path, 'DELETE');
        }
      };
    },
  },
  // Register users and user support.
  {
    section: 'register',
    names: ['register-user-edit-screen', 'register-associate-admin-user-form', 'register-registration-edit-screen'],
    apply: async () => {
      const { tenant } = await apiRequest(`/api/tenant/${defaultTenantId}`);
      await apiRequest(`/api/tenant/${defaultTenantId}`, 'PATCH', { tenant: { themeId: registerIds.theme, formConfiguration: { adminUserFormId: registerIds.adminUser } } });
      return () => apiRequest(`/api/tenant/${defaultTenantId}`, 'PUT', { tenant });
    },
  },
  {
    section: 'register',
    names: ['register-first-step-no-placeholder', 'register-first-step-with-placeholder'],
    apply: async () => {
      const { theme } = await apiRequest(`/api/theme/${registerIds.theme}`);
      const helpers = theme.templates.helpers.replace(/(\[#macro _input_text[\s\S]*?)\[#compress\][\s\S]*?\[\/#compress\]/, '$1');
      await apiRequest(`/api/theme/${registerIds.theme}`, 'PATCH', { theme: { templates: { helpers } } });
      return () => apiRequest(`/api/theme/${registerIds.theme}`, 'PATCH', { theme: { templates: { helpers: theme.templates.helpers } } });
    },
  },
];



// alerts that are what the screenshot shows
const keepAlerts = ['account-not-registered', 'account-configuration-incomplete', 'account-recovery-codes', 'authenticate-account-lock-user-view', 'authenticate-mfa-code-sent', 'manage-user-actions-locked-account'];

// one box around a whole form section, named as in [data-section]
const sectionBoxes = {
  'account-tenant-webauthn': 'bootstrap-passkey-authentication',
  'account-tenant-mfa-email': 'email-settings',
  'account-tenant-mfa-phone': 'phone-settings',
  'idp-cors-warning-okta': 'okta-saml',
  'idp-cors-warning-samlv2': 'pied-piper-saml',
  'idp-cors-warning-apple': 'apple',
  // Authenticate users.
  'authenticate-account-lock-tenant-settings': 'failed-authentication-settings',
  'register-associate-admin-user-form': 'form-settings',
  'register-associate-admin-registration-form': 'form-settings',
};

const registrationMessages = `# Theme messages for custom form
user.data.currentAuth=Who is your current auth provider?
user.data.futureAuth=Who is your future auth provider?
[invalid]user.data.futureAuth=You should really give FusionAuth a try.`;

export default {
  baseUrl: 'http://localhost:9011',
  outputDir: 'public/img/docs/screenshots',
  window: { width: 1100, height: 800 },
  browser: 'webkit',
  // render in a pinned linux container so macos and ci produce identical text
  browserContainer: true,
  chrome: {
    style:    'golden-gate',
    renderIn: 'css',
    showUrl:  true,
    url:      'local.fusionauth.io',
    theme:    'light',
  },

  docker: {
    compose:  'screenshots/docker-compose.yml',
    service:  'fusionauth',
    healthcheck: {
      url:      'http://localhost:9011/api/status',
      timeout:  120000,
      interval: 3000,
    },
  },

  beforeAll: async (context) => {
    const page = await context.newPage();

    // FusionAuth's API healthcheck passes before the kickstart finishes and the
    // login UI becomes available. Retry navigation until the login form appears.
    const deadline = Date.now() + 150_000;
    while (Date.now() < deadline) {
      await page.goto('http://localhost:9011/admin/login', {
        waitUntil: 'load',
        timeout: 15000,
      }).catch(() => {});
      const ready = await page.$('#loginId');
      if (ready) break;
      await new Promise(r => setTimeout(r, 3000));
    }

    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    // press Enter to submit -- more reliable than clicking a specific button selector
    await page.keyboard.press('Enter');
    // the login page is under /admin too, so wait until it has been left
    await page.waitForURL(url => url.pathname.startsWith('/admin') && !url.pathname.startsWith('/admin/login'), { timeout: 30000 });
    adminLocale = (await context.cookies('http://localhost:9011')).find(c => c.name === 'fusionauth.locale')?.value;
    await page.close();

    // Configure tenant and set up screenshot infrastructure.
    const apiKey = 'screenshot-dev-key-not-for-production';
    const baseUrl = 'http://localhost:9011';
    const tenantId = '30663132-6464-6665-3032-326466613934';
    const messengerId = '00000000-0000-0000-0000-500000000001';

    const appId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
    const richardId = '00000000-0000-0000-0000-100000000001';

    // activate license if key is provided (enables WebAuthn and other licensed features)
    if (process.env.FUSIONAUTH_LICENSE_KEY) {
      try {
        const licResp = await fetch(`${baseUrl}/api/reactor`, {
          method: 'POST',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ licenseId: process.env.FUSIONAUTH_LICENSE_KEY }),
        });
        // 409 = already activated, both are fine
        if (!licResp.ok && licResp.status !== 409) {
          throw new Error(`${licResp.status} ${await licResp.text()}`);
        } else {
          // poll until licensed: true (reactor activates asynchronously)
          const licDeadline = Date.now() + 15_000;
          while (Date.now() < licDeadline) {
            const statusResp = await fetch(`${baseUrl}/api/reactor`, { headers: { 'Authorization': apiKey } });
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
            headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant: { webAuthnConfiguration: {
              enabled: true,
              bootstrapWorkflow: { enabled: true },
              reauthenticationWorkflow: { enabled: true },
            } } }),
          });
          // ensure Richard is registered with Pied Piper (idempotent -- 400 if already exists)
          await fetch(`${baseUrl}/api/user/registration/${richardId}`, {
            method: 'POST',
            headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ registration: { applicationId: appId, roles: ['admin'] } }),
          });
        }
      } catch (e) {
        throw new Error(`beforeAll: license setup failed: ${e.message}`, { cause: e });
      }
    }

    // the self-service form for the Pied Piper account pages
    try {
      const r = await fetch(`${baseUrl}/api/application/${appId}`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ application: { formConfiguration: { selfServiceFormId: await selfServiceFormId() } } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: selfServiceFormId patch failed: ${e.message}`, { cause: e });
    }

    // ensure Screenshots Theme exists (used by theme-localization-messages screenshot)
    try {
      const themeId = '00000000-0000-0000-0000-300000000001';
      const tResp = await fetch(`${baseUrl}/api/theme/${themeId}`, { headers: { 'Authorization': apiKey } });
      if (!tResp.ok) {
        await fetch(`${baseUrl}/api/theme/${themeId}`, {
          method: 'POST',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceThemeId: '75a068fd-e94b-451a-9aeb-3ddb9a3b5987', theme: { id: themeId, name: 'Screenshots Theme' } }),
        });
        console.log('[screenshot] beforeAll: created Screenshots Theme');
      }
    } catch (e) {
      throw new Error(`beforeAll: Screenshots Theme creation failed: ${e.message}`, { cause: e });
    }

    // the theme preview page loads every template in its own frame, which outlasts the page load timeout;
    // blank the ones no screenshot shows
    await context.route('**/admin/theme/preview?*', route => {
      const template = new URL(route.request().url()).searchParams.get('template');
      if (['oauth2Authorize', 'oauth2Logout', 'oauth2Register'].includes(template)) return route.continue();
      return route.fulfill({ contentType: 'text/html', body: '<!doctype html><html><body></body></html>' });
    });

    // themes for the theme pages: a branded simple theme and the dark theme from the Kickstart tutorial
    try {
      const theme = (id, method, body) => fetch(`${baseUrl}/api/theme/${id}`, {
        method, headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }).then(async r => { if (!r.ok) throw new Error(`${method} theme ${id}: ${r.status} ${await r.text()}`); });
      const exists = async id => (await fetch(`${baseUrl}/api/theme/${id}`, { headers: { 'Authorization': apiKey } })).ok;

      if (!(await exists(piedPiperThemeId))) await theme(piedPiperThemeId, 'POST', { sourceThemeId: simpleThemeId, theme: { name: 'Pied Piper' } });
      await theme(piedPiperThemeId, 'PATCH', { theme: { variables: {
        primaryButtonColor: '#1f8a4c', primaryButtonFocusColor: '#17703c', linkTextColor: '#1f8a4c', linkTextFocusColor: '#17703c',
        pageBackgroundColor: '#e7f2eb', iconBackgroundColor: '#1f8a4c',
      } } });

      if (!(await exists(darkThemeId))) await theme(darkThemeId, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Dark Theme' } });
      const { theme: source } = await (await fetch(`${baseUrl}/api/theme/${defaultThemeId}`, { headers: { 'Authorization': apiKey } })).json();
      const stylesheet = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'screenshots/themes/dark-theme.css'), 'utf-8');
      await theme(darkThemeId, 'PATCH', { theme: { stylesheet, defaultMessages: source.defaultMessages } });
    } catch (e) {
      throw new Error(`beforeAll: theme setup failed: ${e.message}`, { cause: e });
    }

    // always PUT the canonical email template content (matches the .ftl files referenced in the docs)
    try {
      const htmlTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\n<p>\n  Login code: ${oneTimeCode}\n</p>\n[#else]\n<p>\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n  <a href="${url?html}">${url?html}</a>\n</p>\n[/#if]\n- Pied Piper';
      const txtTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this email address. If you do not recognize this request please ignore this email.\n\n[#if oneTimeCode??]\nLogin code: ${oneTimeCode}\n[#else]\n[#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n[#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n${url}\n\n[/#if]\n- Pied Piper';
      const etMethod = (await fetch(`${baseUrl}/api/email/template/00000000-0000-0000-0000-400000000001`, { headers: { 'Authorization': apiKey } })).ok ? 'PUT' : 'POST';
      await fetch(`${baseUrl}/api/email/template/00000000-0000-0000-0000-400000000001`, {
        method: etMethod,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTemplate: { name: 'Pied Piper Passwordless Login', defaultSubject: 'Complete your Pied Piper login', defaultHtmlTemplate: htmlTpl, defaultTextTemplate: txtTpl } }),
      });
    } catch (e) {
      throw new Error(`beforeAll: email template update failed: ${e.message}`, { cause: e });
    }

    // always PUT the canonical message template content
    try {
      const smsTpl = '[#setting url_escaping_charset="UTF-8"]\nYou have requested to log into Pied Piper using this phone number. If you do not recognize this request please ignore this message.\n\n[#if oneTimeCode??]\n  Login code: ${oneTimeCode}\n[#else]\n  [#assign url = "${baseUrl}/oauth2/passwordless/${code}?tenantId=${user.tenantId}" /]\n  [#list state!{} as key, value][#if key != "tenantId" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]\n\n  ${url}\n[/#if]\n\n- Pied Piper';
      const mtMethod = (await fetch(`${baseUrl}/api/message/template/00000000-0000-0000-0000-400000000002`, { headers: { 'Authorization': apiKey } })).ok ? 'PUT' : 'POST';
      await fetch(`${baseUrl}/api/message/template/00000000-0000-0000-0000-400000000002`, {
        method: mtMethod,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageTemplate: { name: 'Pied Piper Passwordless SMS', type: 'SMS', defaultTemplate: smsTpl } }),
      });
    } catch (e) {
      throw new Error(`beforeAll: message template update failed: ${e.message}`, { cause: e });
    }

    // create Generic HTTP messenger for phone OTP flow (points to sms-mock service in docker-compose)
    try {
      const mResp = await fetch(`${baseUrl}/api/messenger/${messengerId}`, { headers: { 'Authorization': apiKey } });
      if (!mResp.ok) {
        await fetch(`${baseUrl}/api/messenger/${messengerId}`, {
          method: 'POST',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messenger: { id: messengerId, type: 'Generic', name: 'Pied Piper SMS', url: 'http://sms-mock:8081/', connectTimeout: 2000, readTimeout: 2000, debug: false } }),
        });
        console.log('[screenshot] beforeAll: created SMS mock messenger');
      }
    } catch (e) {
      throw new Error(`beforeAll: messenger setup failed: ${e.message}`, { cause: e });
    }

    // the example webhook for the tenant Webhooks tab and the webhook pages
    try {
      const webhookUrl = `${baseUrl}/api/webhook/${exampleWebhookId}`;
      if (!(await fetch(webhookUrl, { headers: { 'Authorization': apiKey } })).ok) {
        const r = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhook: { url: 'https://example.com/fusionauth-events', description: 'Example webhook', connectTimeout: 1000, readTimeout: 2000 } }),
        });
        if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
      }
    } catch (e) {
      throw new Error(`beforeAll: webhook setup failed: ${e.message}`, { cause: e });
    }

    // configure tenant email: set passwordless email template (needed for the login button to render)
    try {
      const r = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: { emailConfiguration: { passwordlessEmailTemplateId: '00000000-0000-0000-0000-400000000001' } } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: email template PATCH failed: ${e.message}`, { cause: e });
    }

    // configure tenant phone: messenger + SMS template (separate PATCH so email config isn't blocked by phone errors)
    try {
      const r = await fetch(`${baseUrl}/api/tenant/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant: { phoneConfiguration: { messengerId: messengerId, passwordlessTemplateId: '00000000-0000-0000-0000-400000000002' } } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    } catch (e) {
      throw new Error(`beforeAll: phone PATCH failed: ${e.message}`, { cause: e });
    }

    // fill in every tab of Dinesh's user page
    const api = async (method, path, body) => {
      const r = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
        body: body && JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`beforeAll: ${method} ${path} failed: ${r.status} ${await r.text()}`);
      return r.json().catch(() => ({}));
    };
    const licensed = !!process.env.FUSIONAUTH_LICENSE_KEY;

    // sessions come from logins with refresh tokens, before MFA would stop them
    await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { allowTokenRefresh: true, generateRefreshTokens: true } } });
    // the setting can take a moment to apply, so wait for Monica's logins to get a refresh token
    for (let i = 0; !(await api('POST', '/api/login', { loginId: 'monica@raviga.com', password: 'password', applicationId: appId })).refreshToken; i++) {
      if (i === 20) throw new Error('beforeAll: no refresh token');
      await new Promise(r => setTimeout(r, 500));
    }
    await api('DELETE', `/api/jwt/refresh?userId=${monicaId}`);
    for (const [name, type] of [['macOS Chrome', 'BROWSER'], ['iPhone', 'MOBILE']]) {
      const login = await api('POST', '/api/login', { loginId: 'dinesh@piedpiper.com', password: 'password', applicationId: appId, ipAddress: '127.0.0.1', metaData: { device: { name, type } } });
      if (!login.refreshToken) throw new Error(`beforeAll: no ${name} session`);
    }
    await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { allowTokenRefresh: false, generateRefreshTokens: false } } });

    await api('PATCH', `/api/user/${dineshId}`, { user: {
      birthDate: '1988-03-11',
      mobilePhone: '+15555550123',
      data: { company: 'Pied Piper', hometown: 'Karachi', occupation: 'Software Engineer' },
      twoFactor: { methods: [
        { method: 'authenticator', secret: 'N2YUNLQVJAXECEMGTAQXIXOYQ4AQBIH3' },
        ...(licensed ? [{ method: 'email', email: 'dinesh@piedpiper.com' }, { method: 'sms', mobilePhone: '+15555550123' }] : []),
      ] },
    } });

    await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { familyConfiguration: { enabled: true } } });
    await api('PATCH', `/api/user/${gilfoyleId}`, { user: { birthDate: '1985-07-02' } });
    await api('POST', `/api/user/family/${familyId}`, { familyMember: { userId: dineshId, owner: true, role: 'Adult' } });
    await api('PUT', `/api/user/family/${familyId}`, { familyMember: { userId: gilfoyleId, role: 'Adult' } });
    await api('PATCH', `/api/tenant/${tenantId}`, { tenant: { familyConfiguration: { enabled: false } } });

    await api('POST', '/api/identity-provider/00000000-0000-0000-0000-900000000001', { identityProvider: {
      type: 'OpenIDConnect', name: 'Pied Piper IdP', enabled: true,
      oauth2: { client_id: 'pied-piper', client_secret: 'not-a-secret', authorization_endpoint: 'https://idp.example.com/authorize', token_endpoint: 'https://idp.example.com/token', userinfo_endpoint: 'https://idp.example.com/userinfo', scope: 'openid' },
    } });
    await api('POST', '/api/identity-provider/link', { identityProviderId: '00000000-0000-0000-0000-900000000001', userId: dineshId, identityProviderUserId: 'dinesh', displayName: 'dinesh@piedpiper.com' });

    await api('POST', '/api/consent/00000000-0000-0000-0000-c00000000001', { consent: { name: 'Marketing emails', defaultMinimumAgeForSelfConsent: 13 } });
    await api('POST', '/api/user/consent', { userConsent: { consentId: '00000000-0000-0000-0000-c00000000001', userId: dineshId, giverUserId: dineshId } });

    await api('POST', '/api/user-action/00000000-0000-0000-0000-d00000000001', { userAction: { name: 'Bought subscription', temporal: true } });
    await api('POST', '/api/user-action/00000000-0000-0000-0000-d00000000002', { userAction: { name: 'Sent welcome pack' } });
    await api('POST', '/api/user/comment', { userComment: { userId: dineshId, commenterId: richardId, comment: 'Asked to keep his account' } });
    await api('POST', '/api/user/action', { broadcast: false, action: { actioneeUserId: dineshId, actionerUserId: richardId, comment: 'Hoodie and stickers', userActionId: '00000000-0000-0000-0000-d00000000002' } });
    await api('POST', '/api/user/action', { broadcast: false, action: { actioneeUserId: dineshId, actionerUserId: richardId, comment: 'Paid by card', expiry: Date.now() + 30 * 864e5, userActionId: '00000000-0000-0000-0000-d00000000001' } });

    if (licensed) {
      await api('POST', `/api/entity/type/${printersTypeId}`, { entityType: { name: 'Printers', permissions: [
        { name: 'Print', description: 'Send print jobs', isDefault: true },
        { name: 'Settings', description: 'Change printer settings' },
      ] } });
      for (const [id, name, permissions] of [['00000000-0000-0000-0000-b00000000001', 'Front Office Printer', ['Print', 'Settings']], ['00000000-0000-0000-0000-b00000000002', 'Back Office Printer', ['Print']]]) {
        await api('POST', `/api/entity/${id}`, { entity: { name, type: { id: printersTypeId }, clientId: id, clientSecret: 'printer-secret-not-for-production' } });
        await api('POST', `/api/entity/${id}/grant`, { grant: { userId: dineshId, permissions } });
      }
      const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
      await api('POST', '/api/webauthn/import', { credentials: [{
        id: '00000000-0000-0000-0000-e00000000001', userId: dineshId, name: 'MacBook Touch ID', displayName: 'dinesh@piedpiper.com',
        algorithm: -7, attestationType: 'none', credentialId: 'ZGluZXNoLXBhc3NrZXk', publicKey: publicKey.export({ type: 'spki', format: 'pem' }),
        relyingPartyId: 'localhost', discoverable: true, authenticatorSupportsUserVerification: true, signCount: 0, data: {},
      }] });
    }

    // deactivated users show as locked
    await api('DELETE', `/api/user/${gavinId}`);
  },

  beforeScreenshot: async (page, ctx) => {
    // use the original URL from context -- page.url() may drop the hash after SPA navigation
    const url = ctx?.url ?? page.url();
    const { pathname, hash } = new URL(url);
    const fragment = hash.slice(1);

    if (savedSso && !signedOut.includes(ctx?.name)) {
      await page.context().addCookies([savedSso]);
      savedSso = undefined;
      await page.goto(url, { waitUntil: 'networkidle' });
    }

    // opening an /account page resets this to en
    if (adminLocale && pathname.startsWith('/admin')) {
      const context = page.context();
      const locale = (await context.cookies('http://localhost:9011')).find(c => c.name === 'fusionauth.locale');
      if (locale?.value !== adminLocale) {
        await context.addCookies([{ name: 'fusionauth.locale', value: adminLocale, url: 'http://localhost:9011' }]);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }

    if (registerCookies) {
      await page.context().clearCookies();
      await page.context().addCookies(registerCookies);
      registerCookies = undefined;
      await page.goto(url, { waitUntil: 'networkidle' });
    }

    const oauthAppId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
    const oauthTenantId = '30663132-6464-6665-3032-326466613934';
    const oauthLoginUrl = `http://localhost:9011/oauth2/authorize?client_id=${oauthAppId}&redirect_uri=https%3A%2F%2Fexample.com&response_type=code&scope=openid`;

    const apiKey = 'screenshot-dev-key-not-for-production';

    for (const state of temporaryState) {
      if (state.section === 'register' && state.undo && !state.names.includes(ctx?.name)) {
        await state.undo();
        state.undo = undefined;
      }
    }

    {
      const api = (path, method = 'GET', body, headers = {}) => fetch(`http://localhost:9011${path}`, {
        method, headers: { 'Authorization': apiKey, 'Content-Type': 'application/json', ...headers }, body: body && JSON.stringify(body),
      }).then(async r => {
        const text = await r.text();
        if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${text}`);
        return text ? JSON.parse(text) : null;
      });
      const exists = async path => (await fetch(`http://localhost:9011${path}`, { headers: { 'Authorization': apiKey } })).ok;
      // deletes come first, since a second tenant makes creating an application need a tenant Id
      const unwantedFirst = [...temporaryResources].sort((a, b) => a.names.includes(ctx?.name) - b.names.includes(ctx?.name));
      for (const resources of unwantedFirst) {
        const wanted = resources.names.includes(ctx?.name);
        if (wanted === await exists(resources.paths[0])) continue;
        // clears what a failed create left behind too
        for (const path of resources.paths) {
          if (!(await exists(path))) continue;
          for (let i = 0; ; i++) {
            // applications and user actions otherwise remain deactivated
            try { await api((path.startsWith('/api/application/') || path.startsWith('/api/user-action/')) && !path.includes('hardDelete=') ? `${path}${path.includes('?') ? '&' : '?'}hardDelete=true` : path, 'DELETE'); break; } catch (e) {
              // a form stays in use until its deleted application is gone
              if (i >= 60 || !e.message.includes('[inUse]')) throw e;
              await page.waitForTimeout(500);
            }
          }
          // applications and tenants are deleted in the background
          for (let i = 0; i < 60 && await exists(path); i++) await page.waitForTimeout(500);
        }
        if (wanted) await resources.create(api, ctx?.name);
        // the admin UI caches the tenant count; two tenants adds a Tenant field to some forms
        if (resources.paths[0].startsWith('/api/tenant/')) await page.waitForTimeout(5000);
        // goto alone keeps the loaded page when only the fragment differs
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.reload({ waitUntil: 'networkidle' });
      }
    }

    for (const state of temporaryState) {
      const wanted = state.names.includes(ctx?.name);
      if (wanted === !!state.undo) continue;
      if (wanted) state.undo = await state.apply(page);
      else {
        await state.undo();
        state.undo = undefined;
      }
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.reload({ waitUntil: 'networkidle' });
    }

    // Normalize action dates before the table performs its initial layout.
    if (ctx?.name === 'register-remove-user-action') {
      await page.route(`**/admin/user/manage/${dineshId}*`, async route => {
        const response = await route.fetch();
        const body = (await response.text())
          .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '24/09/2026')
          .replace(/\b\d{2}:\d{2}(:\d{2}(,\d{3})?)? (AM|PM)\b/g, '09:00 AM');
        await route.fulfill({ response, body });
      });
      await page.reload({ waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
    }

    // FusionAuth picks up a theme change after a delay
    if (pathname.startsWith('/account')) {
      const modified = ctx?.name === 'account-home-birthdate';
      for (let i = 0; i < 60 && modified !== await page.getByText('This is now modified').isVisible(); i++) {
        await page.waitForTimeout(500);
        await page.reload({ waitUntil: 'networkidle' });
      }
    }

    if (ctx?.name === 'migration-tenant-add') {
      await page.fill('#tenant_name', 'Import test');
    }

    // bootstrap-button: tag the "Fingerprint, device or key" link for highlighting
    if (ctx?.name === 'passkeys-bootstrap-button') {
      // FusionAuth shows the magic link button once it picks up the tenant's passwordless template
      for (let i = 0; i < 60 && !await page.getByText(/magic link/i).isVisible(); i++) {
        await page.waitForTimeout(500);
        await page.reload({ waitUntil: 'networkidle' });
      }
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('a, button')];
        let btn = btns.find(el => /fingerprint|device or key/i.test(el.textContent.trim()));
        if (!btn) return;
        // the link is inline; the bordered button is inside it
        btn = btn.querySelector('button') ?? btn;
        // a padded box, so the highlight sits outside the button's own border
        const r = btn.getBoundingClientRect();
        const box = document.createElement('div');
        box.dataset.hl = 'webauthn-bootstrap-btn';
        box.style.cssText = `position:absolute;left:${r.left + scrollX - 6}px;top:${r.top + scrollY - 6}px;width:${r.width + 12}px;height:${r.height + 12}px;pointer-events:none`;
        document.body.append(box);
      });
    }

    // WebAuthn bootstrap login page: click "Fingerprint, device or key" from the OAuth login page
    if (ctx?.name === 'passkeys-bootstrap-login') {
      try {
        await page.locator('a').filter({ hasText: /Fingerprint, device or key/i }).first().click({ timeout: 5000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`passkeys-bootstrap-login: click failed: ${e.message}`, { cause: e });
      }
    }

    // Self-service passkeys page: log in via OAuth then navigate to account webauthn management
    if (ctx?.name === 'passkeys-self-service') {
      try {
        await page.fill('#loginId', 'richard@piedpiper.com');
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        try { await page.waitForURL(/example\.com/, { timeout: 8000 }); } catch {}
        await page.goto(`http://localhost:9011/account/webauthn/?client_id=${oauthAppId}&tenantId=${oauthTenantId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`passkeys-self-service: login/navigate failed: ${e.message}`, { cause: e });
      }
    }

    // Reauth-enable page: mock WebAuthn so the page stays in "waiting" state rather than
    // erroring (WebKit headless does not implement navigator.credentials.create).
    if (ctx?.name === 'passkeys-reauth-enable') {
      try {
        await page.addInitScript(() => {
          if (typeof PublicKeyCredential !== 'undefined') {
            PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = async () => true;
          }
          // return a never-resolving promise so the page's WebAuthn call hangs in
          // the "waiting for authenticator" state rather than throwing
          if (navigator.credentials) {
            navigator.credentials.create = () => new Promise(() => {});
            navigator.credentials.get = () => new Promise(() => {});
          }
        });
        // prompt=login forces the login form even when Richard has an active session
        await page.goto(oauthLoginUrl + '&prompt=login');
        await page.waitForLoadState('networkidle');
        await page.fill('#loginId', 'richard@piedpiper.com');
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        try {
          await Promise.race([
            page.waitForURL(/reauth-enable/, { timeout: 8000 }),
            page.waitForURL(/example\.com/, { timeout: 8000 }),
          ]);
        } catch {
          await page.waitForTimeout(4000);
        }
      } catch (e) {
        throw new Error(`passkeys-reauth-enable: setup failed: ${e.message}`, { cause: e });
      }
    }

    if (ctx?.name === 'tenant-webhooks-settings') {
      const selected = await page.evaluate(() => {
        const box = [...document.querySelectorAll('#webhooks input[type=checkbox]')].find(i => !i.id.startsWith('tenant_eventConfiguration'));
        if (box && !box.checked) box.click();
        return !!box;
      });
      if (!selected) throw new Error('example webhook checkbox not found');
    }

    for (const [id, value] of Object.entries(selects[ctx?.name] ?? {})) {
      const selected = await page.evaluate(([i, v]) => {
        const select = document.getElementById(i);
        if (!select) return false;
        select.value = v;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return select.value === v;
      }, [id, value]);
      if (!selected) throw new Error(`select not set: ${id}=${value}`);
    }

    for (const id of switches[ctx?.name] ?? []) {
      const switched = await page.evaluate(i => {
        const input = document.getElementById(i);
        if (input && !input.checked) input.click();
        return !!input;
      }, id);
      if (!switched) throw new Error(`switch not found: ${id}`);
    }

    // FusionAuth creates the Tenant manager application with a new random id on each start
    if (ctx?.name === 'application-list' || ctx?.name === 'five-minute-application-listing') {
      const pinned = await page.evaluate(() => {
        const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
        const cell = row?.querySelectorAll('td')[1];
        if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
        return !!cell;
      });
      if (!pinned) throw new Error('Tenant manager row not found');
    }

    if (simpleEditorTabs[ctx?.name] || ['theme-simple-editor-light', 'theme-simple-editor-dark'].includes(ctx?.name)) {
      await page.waitForFunction(() => customElements.get('el-tab-list'));
      await page.waitForTimeout(1000);
      if (simpleEditorTabs[ctx.name]) {
        await page.locator('main [role=tab]', { hasText: simpleEditorTabs[ctx.name] }).first().click();
        await page.waitForTimeout(800);
      } else {
        // apply the pre-built theme from its card in the Pre-built themes panel
        const label = ctx.name.endsWith('-dark') ? 'Dark' : 'Light';
        await page.locator('#prebuilt-themes, main [role=tabpanel]:visible').getByText(label, { exact: true }).first().click();
        await page.waitForTimeout(500);
        const confirm = page.locator('.prime-dialog.open button, dialog[open] button').filter({ hasText: /^(Yes|OK|Confirm|Load)/ });
        if (await confirm.count()) await confirm.first().click();
        await page.waitForTimeout(1200);
      }
      // edits in the editor (not saved) so the preview shows what each panel changes
      const setFields = fields => page.evaluate(f => f.every(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return false;
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }), fields);
      if (ctx.name === 'theme-simple-editor-images') {
        await page.locator('#images button', { hasText: 'Background image' }).first().click();
        await page.waitForTimeout(300);
        if (!(await setFields([['backgroundImageURLInput', 'http://localhost:8080/starry-night.jpg']]))) throw new Error('background image field not found');
        await page.waitForTimeout(2000);
      }
      if (ctx.name === 'theme-simple-editor-styles') {
        const set = await setFields([
          ['pageBackgroundColor', '#1d2b4f'], ['primaryButtonColor', '#e2672b'], ['linkTextColor', '#e2672b'], ['iconColor', '#e2672b'],
        ]);
        if (!set) throw new Error('style color fields not found');
        await page.evaluate(() => {
          const font = document.querySelector('#styles select');
          const serif = [...font.options].find(o => /georgia|serif/i.test(o.textContent) && !/sans/i.test(o.textContent));
          if (serif) { font.value = serif.value; font.dispatchEvent(new Event('change', { bubbles: true })); }
        });
        await page.waitForTimeout(1500);
      }
      if (ctx.name === 'theme-simple-editor-messages') {
        await page.locator('#messages a', { hasText: 'Edit' }).first().click();
        await page.locator('.prime-dialog.open').waitFor();
        await page.waitForTimeout(1000);
        const filled = await page.evaluate(() => {
          const editors = [...document.querySelectorAll('.prime-dialog.open .CodeMirror')];
          editors.at(-1)?.CodeMirror?.setValue('oauth2-authorize-page-title=Pied Piper | Log in\noauth2-logout-page-title=Pied Piper | Log out');
          // show the default messages the custom ones override, like the original
          const cm = editors[0]?.CodeMirror;
          const line = cm?.getValue().split('\n').findIndex(l => l.startsWith('oauth2-logout-page-title='));
          if (!(line >= 0)) return false;
          cm.setOption('viewportMargin', Infinity);
          cm.scrollIntoView({ line, ch: 0 }, 80);
          cm.setSelection({ line, ch: 0 }, { line, ch: cm.getLine(line).length });
          return editors.length > 1;
        });
        if (!filled) throw new Error('custom messages editor not found');
      }
      if (ctx.name === 'theme-simple-editor-preview') {
        await page.locator('#pages a', { hasText: 'OAuth register' }).first().click();
        await page.waitForTimeout(1500);
      }
    }

    if (ctx?.name === 'theme-add-advanced') {
      await page.locator('input[name="theme.name"]').fill('Tailwind + DaisyUI');
      await page.evaluate(() => document.activeElement?.blur());
    }

    if (themeSelects[ctx?.name]) {
      const tagged = await page.evaluate(id => {
        const select = [...document.querySelectorAll('select')].find(s => /themeId$/.test(s.id));
        if (!select) return false;
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        (select.closest('[id$="-form-row"]') ?? select.parentElement).dataset.hl = 'theme-select';
        return select.value === id;
      }, themeSelects[ctx.name]);
      if (!tagged) throw new Error('theme select not set');
      // the highlight is centred in the window, so a window twice its height keeps the page at the top
      const center = await page.evaluate(() => { const r = document.querySelector("[data-hl='theme-select']").getBoundingClientRect(); return r.top + r.height / 2 + window.scrollY; });
      await page.setViewportSize({ width: page.viewportSize().width, height: Math.round(center * 2) });
    }

    if (ctx?.name === 'theme-add') {
      const tagged = await page.evaluate(name => {
        const row = [...document.querySelectorAll('tbody tr')].find(tr => tr.querySelector('td')?.textContent.trim() === name);
        if (row) row.dataset.hl = 'theme-row';
        return !!row;
      }, 'Pied Piper');
      if (!tagged) throw new Error('Pied Piper theme row not found');
    }

    if (ctx?.name === 'theme-preview-menu') {
      const opened = await page.evaluate(name => {
        const row = [...document.querySelectorAll('tbody tr')].find(tr => tr.querySelector('td')?.textContent.trim() === name);
        // the actions menu is a popover, which a scripted click doesn't open
        const menu = document.getElementById(row?.querySelector('button[popovertarget]')?.getAttribute('popovertarget'));
        menu?.showPopover();
        return !!menu;
      }, 'Pied Piper');
      if (!opened) throw new Error('Pied Piper theme row not found');
      await page.waitForTimeout(500);
      const tagged = await page.evaluate(() => {
        // the menu is a fixed-position popover, so test its size rather than offsetParent
        const item = [...document.querySelectorAll('a[href^="/admin/theme/view/"]')].find(a => a.getBoundingClientRect().width > 0 && a.textContent.trim() === 'Preview');
        if (item) item.dataset.hl = 'theme-preview';
        return !!item;
      });
      if (!tagged) throw new Error('Preview menu item not shown');
    }

    // theme preview page: show the template named by the URL fragment
    if (pathname.startsWith('/admin/theme/view/') && fragment) {
      const tab = page.locator(`main button[data-tab="${fragment}"]`);
      await tab.click();
      await tab.evaluate(el => { el.scrollIntoView({ block: 'center' }); window.scrollTo(0, 0); });
      await page.waitForTimeout(1500);
    }

    if (ctx?.name === 'theme-dark-messages') {
      await page.locator('main [role=tab]', { hasText: 'Messages' }).first().click();
      await page.waitForTimeout(800);
      await page.locator('#messages a[href*="isDefault=true"]').click();
      await page.locator('.prime-dialog.open .CodeMirror').waitFor();
      await page.waitForTimeout(1000);
      const tagged = await page.evaluate(() => {
        const cm = document.querySelector('.prime-dialog.open .CodeMirror')?.CodeMirror;
        if (!cm) return false;
        // render every line, so a later scroll can't reuse the tagged line's element for another line
        cm.setOption('viewportMargin', Infinity);
        const line = cm.getValue().split('\n').findIndex(l => l.startsWith('forgot-your-password='));
        if (line < 0) return false;
        cm.scrollIntoView({ line, ch: 0 }, 120);
        cm.refresh();
        const el = [...document.querySelectorAll('.prime-dialog.open .CodeMirror-line')].find(l => l.textContent.startsWith('forgot-your-password='));
        if (el) el.dataset.hl = 'forgot-message';
        return !!el;
      });
      if (!tagged) throw new Error('forgot-your-password message line not found');
    }

    if (ctx?.name === 'theme-create-api-key') {
      const tagged = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('input[type=checkbox]')].filter(i => i.name === "apiKey.permissions.endpoints['/api/theme']");
        for (const box of boxes) if (['GET', 'PATCH'].includes(box.value) && !box.checked) box.click();
        const row = boxes[0]?.closest('tr');
        if (row) row.dataset.hl = 'api-theme-row';
        return !!row;
      });
      if (!tagged) throw new Error('/api/theme permission row not found');
    }

    // webhook and system settings forms: click the tab named by the URL fragment
    if (/^\/admin\/(webhook\/(add|edit)|system-configuration\/edit)/.test(pathname) && fragment) {
      const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
      if (!label) throw new Error(`no tab for #${fragment}`);
      await selectTab(page, label);
    }

    if (ctx?.name === 'webhook-add') {
      await page.fill('#webhook_url', 'https://example.com/fusionauth-events');
      await page.fill('#webhook_description', 'Example webhook');
    }

    if (ctx?.name === 'webhook-headers') {
      await page.locator('#header-add-button').click();
      const row = page.locator('#header-table tbody tr').last();
      await row.locator('input').nth(0).fill('Authorization');
      await row.locator('input').nth(1).fill('my-api-key');
    }

    if (ctx?.name === 'webhook-signature') {
      const chosen = await page.evaluate(() => {
        const select = document.getElementById('webhook_signatureConfiguration_signingKeyId');
        const option = [...(select?.options ?? [])].find(o => o.value);
        if (option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
        return !!option;
      });
      if (!chosen) throw new Error('no signing key to choose');
    }

    if (ctx?.name === 'webhook-key-gen') {
      const opened = await page.evaluate(() => {
        const item = document.querySelector('[popover] a[href="/ajax/key/generate/RSA"]');
        item?.closest('[popover]').showPopover();
        if (item) item.dataset.hl = 'generate-rsa';
        return !!item;
      });
      if (!opened) throw new Error('Generate RSA key pair menu item not found');
      await page.waitForTimeout(500);
    }

    // a webhook event in the log, sent once by pointing the example webhook at the receiver for a moment
    if (ctx?.name?.startsWith('webhook-event-')) {
      const api = (path, method = 'GET', body) => fetch(`http://localhost:9011${path}`, {
        method, headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' }, body: body && JSON.stringify(body),
      }).then(async r => {
        const text = await r.text();
        if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${text}`);
        return text ? JSON.parse(text) : null;
      });
      const logged = async () => (await api('/api/system/webhook-event-log/search?numberOfResults=1')).total > 0;
      if (!(await logged())) {
        const { webhook } = await api(`/api/webhook/${exampleWebhookId}`);
        await api('/api/system-configuration', 'PATCH', { systemConfiguration: { webhookEventLogConfiguration: { enabled: true } } });
        await api(`/api/webhook/${exampleWebhookId}`, 'PATCH', { webhook: { url: 'http://api.piedpiper.com/fusionauth/events', global: true, eventsEnabled: { 'audit-log.create': true } } });
        try {
          // FusionAuth picks up the webhook change after a delay and drops events sent before then
          for (let i = 0; i < 60 && !(await logged()); i++) {
            await api('/api/system/audit-log', 'POST', { auditLog: { insertUser: 'richard@piedpiper.com', message: 'Updated the Pied Piper application' } });
            for (let j = 0; j < 10 && !(await logged()); j++) await page.waitForTimeout(500);
          }
          if (!(await logged())) throw new Error('no webhook event was logged');
        } finally {
          await api(`/api/webhook/${exampleWebhookId}`, 'PUT', { webhook });
          await api('/api/system-configuration', 'PATCH', { systemConfiguration: { webhookEventLogConfiguration: { enabled: false } } });
        }
        await page.reload({ waitUntil: 'networkidle' });
      }
      if (ctx.name !== 'webhook-event-log-list' && ctx.name !== 'webhook-event-log-settings') {
        // the Manage link sits in the row's actions menu
        for (let i = 0; i < 20 && !(await page.locator('main a[href*="/webhook-event-log/manage/"]').count()); i++) {
          await page.waitForTimeout(1000);
          await page.reload({ waitUntil: 'networkidle' });
        }
        const manage = await page.locator('main a[href*="/webhook-event-log/manage/"]').first().getAttribute('href');
        await page.goto(new URL(manage, page.url()).href, { waitUntil: 'networkidle' });
        await tabsReady(page);
        if (ctx.name === 'webhook-event-source') await selectTab(page, 'Source');
        if (ctx.name === 'webhook-event-attempt') {
          // the View link sits in the row's actions menu
          await page.evaluate(() => {
            const link = document.querySelector('main a[href*="/webhook-attempt-log/view/"]');
            link?.closest('[popover]')?.showPopover();
            link?.click();
          });
          await page.locator('.prime-dialog.open, dialog[open]').first().waitFor();
          await page.waitForTimeout(500);
        }
      }
    }

    if (ctx?.name === 'lambda-populate') {
      await page.fill('#lambdaId', atestLambdaId);
      await page.fill('#lambda_name', '[ATest]');
      await page.selectOption('select[name="lambda.type"]', 'JWTPopulate');
      await page.waitForTimeout(500);
      const set = await page.evaluate(body => {
        const debug = document.getElementById('lambda_debug');
        if (debug && !debug.checked) debug.click();
        const cm = document.querySelector('main .CodeMirror')?.CodeMirror;
        cm?.setValue(body);
        return !!cm;
      }, atestBody('Hello'));
      if (!set) throw new Error('lambda body editor not found');
    }

    if (ctx?.name === 'lambda-edit-application') {
      const set = await page.evaluate(id => {
        const select = document.getElementById('application_lambdaConfiguration_accessTokenPopulateId');
        if (!select) return false;
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        return select.value === id;
      }, atestLambdaId);
      if (!set) throw new Error('access token populate lambda not set');
    }

    if (ctx?.name === 'lambda-registration-messages') {
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

    // the registration form's second step, before and after the lambda rejects it
    if (signedOut.includes(ctx?.name)) {
      const context = page.context();
      savedSso ??= (await context.cookies('http://localhost:9011')).find(c => c.name === 'fusionauth.sso');
      await context.clearCookies({ name: 'fusionauth.sso' });
      await page.goto(url, { waitUntil: 'networkidle' });
    }

    if (ctx?.name === 'lambda-registration-blank' || ctx?.name === 'lambda-registration-invalid') {
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
      if (ctx.name === 'lambda-registration-invalid') {
        await page.fill('#user_data_currentAuth', 'BadAuth');
        await page.fill('#user_data_futureAuth', 'AuthTwo');
        await page.locator('form button[type=submit], form button').last().click();
        await page.waitForLoadState('networkidle');
      }
    }

    // tags elements that a plain selector can't single out
    const tag = async (name, find) => {
      const tagged = await page.evaluate(([n, f]) => {
        const el = new Function(`return (${f})`)()();
        if (el) el.dataset.hl = n;
        return !!el;
      }, [name, find.toString()]);
      if (!tagged) throw new Error(`nothing to tag as ${name}`);
    };

    if (ctx?.name === 'five-minute-dashboard') {
      await tag('applications-nav', () => [...document.querySelectorAll('nav a[href="/admin/application/"]')].find(a => a.offsetParent));
    }

    if (ctx?.name === 'five-minute-application-details') {
      await page.evaluate(id => {
        const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
        link?.closest('[popover]')?.showPopover();
        link?.click();
      }, exampleAppId);
      await page.locator('.prime-dialog.open, dialog[open]').first().waitFor();
      await page.waitForTimeout(800);
      await tag('client-credentials', () => {
        const rows = [...document.querySelectorAll('.prime-dialog.open tr, dialog[open] tr, .prime-dialog.open dt, dialog[open] dt')];
        const id = rows.find(r => /^Client Id/i.test(r.textContent.trim()));
        const secret = rows.find(r => /^Client secret/i.test(r.textContent.trim()));
        if (!id || !secret) return null;
        let scroller = id.parentElement;
        while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
        if (scroller) scroller.scrollTop += id.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
        // one box around both rows
        const box = document.createElement('div');
        const a = id.getBoundingClientRect(), b = secret.getBoundingClientRect();
        box.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
        document.body.append(box);
        return box;
      });
    }

    if (ctx?.name === 'five-minute-user-search') {
      await page.fill('#s_queryString', 'dinesh');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => [...document.querySelectorAll('main tbody tr')].length === 1, null, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      // the Manage link sits in the row's actions menu, so mark the row
      await tag('manage-user', () => document.querySelector('main a[href^="manage/00000000-0000-0000-0000-100000000004"]')?.closest('tr'));
    }

    if (ctx?.name === 'five-minute-registration-add') {
      const add = await page.locator('a[href^="/admin/user/registration/add/"]').first().getAttribute('href');
      await page.goto(new URL(add, page.url()).href, { waitUntil: 'networkidle' });
      await page.locator('select').first().selectOption({ label: 'Example app' });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      await page.evaluate(() => document.activeElement?.blur());
    }

    if (ctx?.name === 'multi-tenant-users') {
      await page.fill('#s_queryString', 'jian');
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => [...document.querySelectorAll('main tbody tr')].length === 2, null, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await tag('tenant-column', () => {
        const table = document.querySelector('main table');
        const index = [...(table?.querySelectorAll('thead th') ?? [])].findIndex(th => th.textContent.trim() === 'Tenant');
        if (index < 0) return null;
        const cells = [...table.querySelectorAll('tr')].map(tr => tr.children[index]).filter(Boolean);
        const first = cells[0].getBoundingClientRect(), last = cells.at(-1).getBoundingClientRect();
        const box = document.createElement('div');
        box.style.cssText = `position:absolute;left:${first.left + scrollX}px;top:${first.top + scrollY}px;width:${first.width}px;height:${last.bottom - first.top}px;pointer-events:none`;
        document.body.append(box);
        return box;
      });
    }

    if (ctx?.name === 'multi-tenant-control-plane-registration') {
      await tag('self-service-switch', () => document.getElementById('application_registrationConfiguration_enabled')?.closest('fieldset'));
    }

    if (ctx?.name === 'multi-tenant-blueprint-tenant') {
      await page.fill('#tenant_name', 'Blueprint Tenant');
    }

    // the entities page lists nothing until searched
    if (ctx?.name === 'hierarchy-entities') {
      await page.locator('main button', { hasText: 'Search' }).first().click();
      await page.waitForFunction(() => document.querySelectorAll('main tbody tr').length >= 7, null, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }

    if (ctx?.name === 'hierarchy-user-grant') {
      await tabsReady(page);
      await selectTab(page, 'Entity grants');
      await page.waitForFunction(() => [...document.querySelectorAll('#entity-grants tbody tr')].some(tr => tr.textContent.includes('Change Bank Operations')), null, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }

    if (ctx?.name === 'segment-add-user') {
      await page.fill('#user_email', 'test@example.com');
      await page.fill('#user_password', 'password');
      await page.fill('#confirm_user_password', 'password');
    }

    if (ctx?.name === 'account-application-details') {
      await page.evaluate(id => {
        const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
        link?.closest('[popover]')?.showPopover();
        link?.click();
      }, piedPiperAppId);
      await page.locator('.prime-dialog.open').waitFor();
      await page.waitForTimeout(800);
      // match the address bar the frame shows, and start the dialog at the Created row like the original
      await page.evaluate(() => {
        const created = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Created/.test(r.textContent.trim()));
        let scroller = created?.parentElement;
        while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
        if (scroller) scroller.scrollTop += created.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll('http://localhost:9011', 'https://local.fusionauth.io');
      });
    }

    if (['account-form-edit', 'account-form-add-field'].includes(ctx?.name)) {
      await page.goto(`http://localhost:9011/admin/form/edit/${await selfServiceFormId()}`, { waitUntil: 'networkidle' });
      if (ctx.name === 'account-form-add-field') {
        await page.locator('a[href="/ajax/form/field/add"]').click();
        await page.locator('.prime-dialog.open #fieldId').selectOption({ label: 'Birthdate' });
        await tag('add-field-dialog', () => {
          // the dimmed page shows through the rounded corners of the crop
          const dialog = document.querySelector('.prime-dialog.open > div');
          for (const el of [dialog, dialog?.parentElement]) el?.style.setProperty('border-radius', '0');
          return dialog;
        });
      }
    }

    if (ctx?.name === 'account-forms-list') {
      await tag('self-service-form', () => [...document.querySelectorAll('main tbody tr')].find(tr => tr.textContent.includes('Default User Self Service')));
    }

    if (ctx?.name === 'account-theme-templates') {
      await tabsReady(page);
      // each label is followed by its tooltip text
      await page.locator('.tab-list-container button', { hasText: /^\s*Account edit\b/ }).click();
      await page.waitForTimeout(500);
      await tag('account-templates', () => {
        const buttons = [...document.querySelectorAll('.tab-list-container button')];
        const first = buttons.find(b => b.textContent.trim().startsWith('Account edit'));
        const last = buttons.find(b => b.textContent.trim().startsWith('Account WebAuthn index'));
        if (!first || !last) return null;
        // the template list scrolls on its own
        first.scrollIntoView({ block: 'start' });
        window.scrollTo(0, 0);
        const a = first.getBoundingClientRect(), b = last.getBoundingClientRect();
        const box = document.createElement('div');
        box.style.cssText = `position:absolute;left:${a.left + scrollX}px;top:${a.top + scrollY}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
        document.body.append(box);
        return box;
      });
    }

    if (ctx?.name === 'account-passkey-add') {
      await page.getByLabel('Display name').fill('Safari Touch ID');
    }

    if (ctx?.name === 'account-edit-password') {
      await page.getByText('Change password').click();
      await page.locator('input[type=password]').first().waitFor();
    }

    // the secret in the page is swapped for the fixed one
    if (ctx?.name === 'account-two-factor-authenticator' || ctx?.name === 'account-recovery-codes') {
      await page.route('**/account/two-factor/enable*', async route => {
        const response = await route.fetch();
        let body = await response.text();
        const value = name => body.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0].match(/value="([^"]+)"/)?.[1];
        const [secret, base32] = [value('secret'), value('secretBase32Encoded')];
        if (secret) body = body.replaceAll(secret, totpSecret.toString('base64')).replaceAll(base32, totpSecretBase32);
        await route.fulfill({ response, body });
      });
      await page.reload({ waitUntil: 'networkidle' });
      if (ctx.name === 'account-recovery-codes') {
        await page.fill('input[name=code]', totpCode());
        await page.getByRole('button', { name: 'Enable', exact: true }).click();
        await page.waitForLoadState('networkidle');
        // the codes are new on each run
        const pinned = await page.evaluate(() => {
          const fixed = ['8SHN5-KXPC9', 'LG4TV-8BRZ3', 'HN5B3-XDTFX', 'NYY6P-DHHL7', 'W6QX9-LDV6L', 'TK265-Z8YNH', 'BX2KZ-N7LHQ', 'LS833-8ST38', 'W8Y5H-SS8KW', '9FDST-S3TFF'];
          let i = 0;
          const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            node.textContent = node.textContent.replace(/\b[A-Z0-9]{5}-[A-Z0-9]{5}\b/g, () => fixed[i++ % fixed.length]);
          }
          return i;
        });
        if (!pinned) throw new Error('recovery codes not shown');
      }
      await page.unrouteAll();
    }

    if (ctx?.name === 'account-two-factor-email' || ctx?.name === 'account-two-factor-phone') {
      const method = ctx.name.endsWith('-email') ? 'email' : 'sms';
      await page.locator('#select-method').selectOption(method);
      await page.waitForTimeout(500);
      if (method === 'email') await page.locator('input[name=email]:visible').fill('example@email.com');
    }

    if (ctx?.name === 'account-two-factor-challenge') {
      await page.fill('#loginId', 'richard@piedpiper.com');
      await page.fill('#password', 'password');
      await page.locator('#submit-button').click();
      await page.waitForURL(/\/oauth2\/two-factor/);
      await page.waitForLoadState('networkidle');
    }

    if (ctx?.name === 'tenant-connector-add-policy') {
      await page.locator('el-tab-list button[aria-controls="connectors"]').click();
      await page.locator('#add-connector-policy').click();
      await page.locator('.prime-dialog.open').waitFor();
    }

    // authenticate users section
    {
      const name = ctx?.name ?? '';
      const host = 'http://localhost:9011';
      if (name.startsWith('authenticate-') && pathname === '/admin/application/') {
        await page.evaluate(() => {
          const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
          const cell = row?.querySelectorAll('td')[1];
          if (cell) cell.textContent = '00000000-0000-0000-0000-f300000001ff';
        });
      }
      // one box around the elements from the first selector to the last, marked [data-hl=name]
      const box = (hl, selectors, pad = 0) => page.evaluate(([hl, selectors, pad]) => {
        const els = selectors.map(s => typeof s === 'string' ? document.querySelector(s) : null);
        if (els.some(e => !e)) return false;
        const rects = els.map(e => e.getBoundingClientRect());
        const scroller = els[0].closest('.prime-dialog')?.querySelector('main');
        const origin = scroller?.getBoundingClientRect();
        if (scroller) scroller.style.position = 'relative';
        const [x, y] = scroller ? [scroller.scrollLeft - origin.left, scroller.scrollTop - origin.top] : [scrollX, scrollY];
        const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
        const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
        const div = document.createElement('div');
        div.dataset.hl = hl;
        div.style.cssText = `position:absolute;left:${left + x - pad}px;top:${top + y - pad}px;width:${right - left + 2 * pad}px;height:${bottom - top + 2 * pad}px;pointer-events:none`;
        (scroller ?? document.body).append(div);
        return true;
      }, [hl, selectors, pad]).then(ok => { if (!ok) throw new Error(`nothing to box as ${hl}`); });
      // marks an element found by its text so a selector can name it
      const mark = (attr, value, selector, text) => page.evaluate(([attr, value, selector, text]) => {
        const el = [...document.querySelectorAll(selector)].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(text));
        if (el) el.setAttribute(attr, value);
        return !!el;
      }, [attr, value, selector, text]).then(ok => { if (!ok) throw new Error(`${selector} "${text}" not found`); });
      const showTab = async () => {
        const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
        await selectTab(page, label);
      };
      const addTokens = async (display, values) => {
        for (const value of values) {
          await page.locator(`#${display} input`).fill(value);
          await page.locator(`#${display} input`).press('Enter');
        }
        await page.evaluate(() => document.activeElement?.blur());
      };
      // The secret has a disabled display field and a hidden form input.
      const setClientSecret = value => page.locator('input[name="application.oauthConfiguration.clientSecret"]').evaluateAll((fields, value) => fields.forEach(field => { field.value = value; }), value);
      const freezeMenu = async selector => page.evaluate(selector => {
        const menu = document.querySelector(selector);
        Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
        const r = menu.getBoundingClientRect();
        const copy = document.createElement('div');
        copy.className = menu.className;
        copy.innerHTML = menu.innerHTML;
        copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
        document.body.append(copy);
        menu.querySelectorAll('[data-hl]').forEach(el => el.removeAttribute('data-hl'));
        menu.hidePopover();
      }, selector);
      // the view dialog from an application or key row's action menu, with the address bar's host in its URLs
      const openView = async (href, firstRow) => {
        await page.evaluate(h => {
          const link = document.querySelector(`main a[href="${h}"]`);
          link?.closest('[popover]')?.showPopover();
          link?.click();
        }, href);
        await page.locator('.prime-dialog.open').waitFor();
        await page.waitForTimeout(800);
        await page.evaluate(([host, first]) => {
          const dialog = document.querySelector('.prime-dialog.open');
          const walker = document.createTreeWalker(dialog, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(host, 'https://local.fusionauth.io');
          for (const tr of dialog.querySelectorAll('tr')) {
            if (tr.textContent.trim().startsWith('Admin registration form Id:')) tr.querySelectorAll('td')[1].textContent = '00000000-0000-0000-0000-f30000000015';
          }
          const row = [...dialog.querySelectorAll('h3, tr')].find(e => e.textContent.replace(/\s+/g, ' ').trim().startsWith(first));
          const scroller = dialog.querySelector('main');
          if (row && scroller) scroller.scrollTop += row.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 8;
        }, [host, firstRow]);
      };
      const row = (n, text) => mark('data-row', n, '.prime-dialog.open tr', text).then(() => `.prime-dialog.open tr[data-row='${n}']`);
      const hostedLogin = async (email) => {
        await page.fill('#loginId', email);
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      };

      if (name === 'authenticate-mfa-self-service-methods') {
        savedSso ??= (await page.context().cookies(host)).find(c => c.name === 'fusionauth.sso');
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

      if (name === 'authenticate-account-lock-user-view') await hostedLogin('jared@piedpiper.com');

      if (name === 'authenticate-mfa-code-sent' || name === 'authenticate-mfa-challenge-methods') {
        await hostedLogin('richard@piedpiper.com');
        await page.waitForURL(/\/oauth2\/two-factor/);
      }

      if (name === 'authenticate-account-lock-admin-view') {
        await tabsReady(page);
        await page.addStyleTag({ content: '#current-actions table { table-layout: fixed; width: 100%; } #current-actions th, #current-actions td { white-space: normal; overflow-wrap: anywhere; }' });
      }

      // ids FusionAuth gives the methods on each run
      if (name.startsWith('authenticate-mfa-admin-')) {
        await selectTab(page, 'Multi-Factor');
        const { user } = await apiRequest(`/api/user/${richardId}`);
        await page.evaluate(ids => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            ids.forEach((id, i) => { node.textContent = node.textContent.replace(new RegExp(`^(\\s*)${id}(\\s*)$`), `$1${['3N92', 'R97L'][i]}$2`); });
          }
        }, (user.twoFactor?.methods ?? []).map(m => m.id));
      }

      if (name === 'authenticate-mfa-admin-disable-method') {
        await mark('data-row', 'authenticator', '#multi-factor tbody tr', 'Authenticator');
        await box('disable-authenticator', ["#multi-factor tr[data-row='authenticator'] td:last-child a, #multi-factor tr[data-row='authenticator'] td:last-child button"], 4);
      }

      if (name === 'authenticate-application-oauth-refresh-grant') {
        await showTab();
        await page.evaluate(() => {
          const grant = document.querySelector('#enabled-grants input[value=refresh_token]');
          if (!grant.checked) grant.click();
          grant.closest('.checkbox').dataset.hl = 'refresh-grant';
        });
      }

      if (name === 'authenticate-application-list-view-menu') {
        await page.evaluate(id => {
          const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
          link?.closest('[popover]')?.showPopover();
          if (link) link.dataset.hl = 'view';
        }, piedPiperAppId);
        await page.waitForTimeout(500);
        await freezeMenu("[popover]:has([data-hl='view'])");
      }

      if (name === 'authenticate-application-add-pied-piper-oauth') {
        await showTab();
        await page.locator('#application_oauthConfiguration_clientId').evaluateAll((fields, id) => fields.forEach(field => { field.value = id; }), piedPiperAppId);
        await setClientSecret('this-is-not-a-secret-its-for-screenshots');
        await addTokens('redirectURLs-display', ['http://piedpiper.local:3000/oauth-redirect']);
      }

      if (name === 'authenticate-application-view-client-credentials') {
        await openView(`/ajax/application/view/${piedPiperAppId}`, 'OAuth configuration');
        await box('client-credentials', [await row('id', 'Client Id:'), await row('secret', 'Client secret:')]);
      }

      if (name === 'authenticate-tableau-application-details') {
        await openView(`/ajax/application/view/${auth.tableauAppId}`, 'OpenID Connect Discovery:');
        await row('discovery', 'OpenID Connect Discovery:');
        await box('client-credentials', [await row('id', 'Client Id:'), await row('auth', 'Client authentication:')]);
      }

      if (['authenticate-application-saml-view-dialog', 'authenticate-tableau-cloud-metadata-url', 'authenticate-sendgrid-saml-details'].includes(name)) {
        await openView(`/ajax/application/view/${auth.samlAppId}`, 'SAML v2 Integration details');
        await mark('data-row', 'saml', '.prime-dialog.open h3', 'SAML v2 Integration details');
        await box('saml-details', [".prime-dialog.open h3[data-row='saml']", await row('initiate', 'Initiate login URL:')], 4);
        await box('entity-login', [await row('entity', 'Entity Id:'), await row('login', 'Login URL:')]);
        await row('metadata', 'Metadata URL:');
      }

      if (name === 'authenticate-zendesk-key-fingerprint') {
        await openView(`/ajax/key/view/${auth.zendeskKeyId}`, 'Fingerprint (MD5):');
        await row('sha256', 'Fingerprint (SHA-256):');
      }

      if (name === 'authenticate-user-registrations-sso' || name === 'authenticate-account-lock-admin-view') await page.waitForTimeout(500);

      if (name === 'authenticate-entity-add-email-api') {
        await page.fill('#entity_name', 'Email API');
        await page.selectOption('#entity_type_id', auth.apiTypeId);
      }

      if (name === 'authenticate-oauth-device-user-code') {
        await page.locator('main input:visible, form input[type=text]:visible').first().pressSequentially('PYYS37');
      }

      if (name === 'authenticate-cockroachdb-application-jwt' || name === 'authenticate-tableau-application-jwt') {
        await showTab();
        await page.evaluate(([id, label]) => {
          for (const key of ['accessTokenKeyId', 'idTokenKeyId']) {
            document.getElementById(`${key}-input`).value = `${label} RS256 Key (RS256)`;
            document.querySelector(`#${key} input[type=hidden]`).value = id;
          }
        }, [auth.tableauKeyId, name.includes('cockroachdb') ? 'CockroachDB' : 'Tableau']);
        await box('signing-keys', ['#accessTokenKeyId', '#idTokenKeyId'], 8);
      }

      if (name === 'authenticate-tableau-cors' || name === 'authenticate-tableau-cloud-cors') {
        await showTab();
        await page.evaluate(() => {
          for (const box of document.querySelectorAll('#corsConfiguration_allowedMethods input')) if (['GET', 'POST'].includes(box.value) && !box.checked) box.click();
        });
        const methods = await page.evaluate(() => [...document.querySelectorAll('#corsConfiguration_allowedMethods input')].filter(i => ['GET', 'POST'].includes(i.value)).map(i => `#${CSS.escape(i.id)}`));
        await page.evaluate(sels => sels.forEach((s, i) => { document.querySelector(s).closest('.checkbox, div').dataset.method = i; }), methods);
        await box('methods', ["#corsConfiguration_allowedMethods [data-method='0']", "#corsConfiguration_allowedMethods [data-method='1']"], 4);
        await addTokens('cors-allowed-origins-display', name === 'authenticate-tableau-cors'
          ? ['https://sso.online.tableau.com', 'https://prod-ch-a.online.tableau.com'] : ['https://sso.online.tableau.com']);
      }

      if (name === 'authenticate-tableau-key-generate-menu' || name === 'authenticate-tableau-key-generate-dialog') {
        await page.evaluate(() => {
          document.querySelectorAll('main tbody tr').forEach((tr, i) => {
            const cell = tr.querySelector('td');
            if (cell) cell.textContent = `00000000-0000-0000-0000-f300000001${String(i).padStart(2, '0')}`;
          });
        });
        await page.evaluate(() => {
          const item = document.getElementById('generate-rsa');
          item?.closest('[popover]').showPopover();
          if (item) item.dataset.hl = 'generate-rsa-item';
          const nav = [...document.querySelectorAll('nav a[href="/admin/key/"]')].find(a => a.offsetParent);
          if (nav) nav.dataset.hl = 'key-master-nav';
          document.getElementById('key-actions-primary').parentElement.dataset.hl = 'key-actions';
        });
        await page.waitForTimeout(500);
        if (name === 'authenticate-tableau-key-generate-menu') await freezeMenu('[popover]:has(#generate-rsa)');
        if (name === 'authenticate-tableau-key-generate-dialog') {
          await page.locator('#generate-rsa').click();
          await page.locator('.prime-dialog.open').waitFor();
          await page.waitForTimeout(500);
          await page.locator('.prime-dialog.open input[name="key.name"]').fill('Tableau RS256 Key');
          await page.evaluate(() => document.activeElement?.blur());
        }
      }

      if (name === 'authenticate-tableau-application-oauth') {
        await showTab();
        await setClientSecret('tableau-secret-not-for-production');
        await page.evaluate(() => {
          const grant = document.querySelector('#enabled-grants input[value=refresh_token]');
          if (!grant.checked) grant.click();
        });
      }

      if (name === 'authenticate-aiven-api-key-add') {
        await page.fill('#apiKey_name', 'Certificate generator');
        await page.fill('#apiKey_key', 'certificate-generator-key-not-for-production-NKU5Ypg');
        await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'Certificate generator');
        await page.evaluate(() => {
          const rows = [...document.querySelectorAll('#endpoints tr')];
          const i = rows.findIndex(tr => tr.firstElementChild?.textContent.trim() === '/api/key/import');
          rows[i].querySelector('input[value=POST]').click();
          rows[i - 2].dataset.scroll = 'api-key-endpoints';
        });
        await page.evaluate(() => document.activeElement?.blur());
      }

      if (name === 'authenticate-aiven-api-keys') {
        await page.locator('main tbody tr').filter({ hasText: 'Certificate generator' }).waitFor();
        await page.evaluate(() => {
          const row = [...document.querySelectorAll('main tbody tr')].find(tr => tr.textContent.includes('Certificate generator'));
          if (row) row.firstElementChild.dataset.hl = 'certificate-key';
        });
      }

      if (name === 'authenticate-aiven-user-add') {
        await page.fill('#user_email', 'laurie@raviga.com');
        await page.fill('#user_username', 'laurie');
        await page.check('#sendSetPasswordIdentityType-doNotSend');
        await page.fill('#user_password', 'password');
        await page.fill('#confirm_user_password', 'password');
        await page.evaluate(() => document.activeElement?.blur());
        await box('email-username', ['#user_email-form-row', '#user_username-form-row'], 8);
        await box('send-email', ['#sendSetPasswordIdentityType-form-row'], 8);
        await box('passwords', ['#user_password-form-row', '#confirm_user_password-form-row'], 8);
      }

      if (name === 'authenticate-zendesk-application-roles') {
        await showTab();
        for (const [role, description] of [['agent', 'Zendesk agent'], ['admin', 'Zendesk admin']]) {
          await page.locator('#role-add-button').click();
          const added = page.locator('#role-table tbody tr').last();
          await added.locator('input[type=text]').first().fill(role);
          await added.locator('input[type=text]').last().fill(description);
        }
        await page.evaluate(() => document.activeElement?.blur());
      }

      if (name === 'authenticate-zendesk-lambda-add') {
        await page.fill('#lambda_name', 'Populate Zendesk roles');
        await page.selectOption('select[name="lambda.type"]', 'SAMLv2Populate');
        await page.waitForTimeout(500);
        const body = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'src/content/docs/lifecycle/authenticate-users/integrations/saml/zendesk.mdx'), 'utf-8')
          .match(/```javascript\n(function populate[\s\S]*?)```/)[1];
        const set = await page.evaluate(body => {
          const cm = document.querySelector('main .CodeMirror')?.CodeMirror;
          cm?.setValue(body);
          return !!cm;
        }, body.trimEnd());
        if (!set) throw new Error('lambda body editor not found');
      }

      if (name === 'authenticate-zendesk-application-saml' || name === 'authenticate-tableau-cloud-application-saml') {
        await showTab();
        await addTokens('application_samlv2Configuration_authorizedRedirectURLs-display', [name === 'authenticate-zendesk-application-saml'
          ? 'https://fusionauth-example.zendesk.com/access/saml/' : 'https://placeholder.example.com/acs']);
      }

      if (name === 'authenticate-sendgrid-metadata') {
        await page.evaluate(host => {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(host, 'https://local.fusionauth.io');
        }, host);
        await page.evaluate(() => {
          const cert = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && /^MII/.test(e.textContent.trim()));
          if (cert) {
            window.scrollTo(0, 0);
            const r = cert.getBoundingClientRect(), left = Math.max(0, r.left);
            const box = document.createElement('div');
            box.dataset.hl = 'certificate';
            box.style.cssText = `position:absolute;left:${left}px;top:${r.top + scrollY}px;width:${Math.min(r.width, innerWidth - left - 8)}px;height:${r.height}px;pointer-events:none`;
            document.body.append(box);
          }
        });
      }
      if (name.startsWith('authenticate-') && name in fixedHeight && fixedHeight[name] === null) await page.evaluate(() => window.scrollTo(0, 0));
    }

    // Manage users and verification
    {
      const name = ctx?.name ?? '';
      const fields = manageFields[name];
      if (fields) {
        for (let i = 0; ; i++) {
          if (await page.evaluate(ids => ids.every(id => document.getElementById(id)), Object.keys(fields))) break;
          if (i === 20) throw new Error(`form fields not rendered: ${Object.keys(fields).join(', ')}`);
          await page.waitForTimeout(500);
          if (i === 10) await page.goto(url, { waitUntil: 'networkidle' });
        }
        const missing = await page.evaluate(values => Object.entries(values).filter(([id, value]) => {
          const el = document.getElementById(id);
          if (!el) return true;
          if (typeof value === 'boolean') {
            if (el.checked !== value) el.click();
          } else {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
          return false;
        }).map(([id]) => id), fields);
        if (missing.length) throw new Error(`fields not found: ${missing.join(', ')}`);
        await page.waitForTimeout(300);
      }

      if (manageLogins[name]) {
        await page.fill('#loginId', manageLogins[name]);
        await page.fill('#password', 'password');
        await page.locator('#submit-button').click();
        await page.waitForLoadState('networkidle');
        if (name !== 'manage-user-actions-locked-account') await page.waitForURL(/verification-required/);
        if (name.includes('registration-gate')) {
          const text = await page.locator('main').first().innerText();
          if (!/verify your registration/i.test(text)) throw new Error(`expected registration gate: ${text}`);
        }
        if (name.endsWith('-gate-code') || name === 'manage-verification-phone-gate') {
          await page.getByLabel('One-time code', { exact: true }).waitFor({ timeout: 10000 }).catch(async error => {
            throw new Error(`expected code entry: ${await page.locator('main').first().innerText()}`, { cause: error });
          });
        }
        await page.evaluate(() => document.activeElement?.blur());
      }

      // the user's email or phone, with its verified icon
      const identity = { 'manage-verification-email-unverified-user': 'Email', 'manage-verification-verified-user': 'Email', 'manage-verification-phone-unverified-user': 'Phone' }[name];
      if (identity) {
        await tag('identity', new Function(`return () => [...document.querySelectorAll('.id-detail-label')].find(l => l.textContent.trim().startsWith('${identity}'))?.parentElement`)());
      }

      if (name === 'manage-verification-registration-unverified-user') {
        await selectTab(page, 'Source');
        const [userId] = verification.users.carla;
        const { user } = await apiRequest(`/api/user/${userId}`);
        await page.evaluate(([ids]) => {
          const pre = document.querySelector('#raw-user pre');
          const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            let text = node.textContent;
            ids.forEach((id, i) => { text = text.replaceAll(id, `00000000-0000-0000-0000-f4000000009${i + 1}`); });
            node.textContent = text.replace(/\b1\d{12}\b/g, '1790000000000');
          }
        }, [user.registrations.map(r => r.id)]);
        await tag('registration-verified', () => {
          const pre = document.querySelector('#raw-user pre');
          const text = pre.textContent;
          const registrations = text.indexOf('"registrations"');
          const match = registrations < 0 ? null : /"verified"\s*:\s*false/.exec(text.slice(registrations));
          if (!match) return null;
          const start = registrations + match.index, end = start + match[0].length;
          const range = document.createRange();
          const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
          let offset = 0;
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const next = offset + node.textContent.length;
            if (start >= offset && start < next) range.setStart(node, start - offset);
            if (end > offset && end <= next) {
              range.setEnd(node, end - offset);
              const marker = document.createElement('span');
              marker.append(range.extractContents());
              range.insertNode(marker);
              return marker;
            }
            offset = next;
          }
          return null;
        });
      }

      if (name === 'manage-verification-application-details' || name === 'manage-pre-verification-application-details') {
        await page.evaluate(() => {
          const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
          const cell = row?.querySelectorAll('td')[1];
          if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
        });
        await page.evaluate(id => {
          const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
          link?.closest('[popover]')?.showPopover();
          link?.click();
        }, verification.appId);
        await page.locator('.prime-dialog.open').waitFor();
        await page.waitForTimeout(800);
        await page.evaluate(() => {
          const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll('http://localhost:9011', 'https://local.fusionauth.io');
          // generated on each run
          const secret = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Client secret/.test(r.textContent.trim()))?.querySelectorAll('td')[1];
          if (secret) secret.textContent = 'pBjyQdXr1T0Hc9vWmA2sKf8LZnE4uYoG6Ri3MxJ7l5Q';
        });
        if (name === 'manage-verification-application-details') {
          await tag('verification-urls', () => {
            const rows = [...document.querySelectorAll('.prime-dialog.open tr')];
            const login = rows.find(r => /^OAuth IdP login URL/i.test(r.textContent.trim()));
            const register = rows.find(r => /^Registration URL/i.test(r.textContent.trim()));
            if (!login || !register) return null;
            const a = login.getBoundingClientRect(), b = register.getBoundingClientRect();
            const box = document.createElement('div');
            box.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
            document.body.append(box);
            return box;
          });
        }
      }

      if (name.startsWith('manage-verification-email-template-')) {
        await tag('verification-template', () => document.getElementById('tenant_emailConfiguration_verificationEmailTemplateId')?.closest('label')?.parentElement);
      }

      if (name === 'manage-verification-application-self-service-phone') {
        await tag('login-type-phone', () => document.querySelector('label[for="application_registrationConfiguration_loginIdType-phoneNumber"]') ?? document.getElementById('application_registrationConfiguration_loginIdType-phoneNumber')?.parentElement);
      }

      if (name === 'manage-user-actions-application-add') {
        await page.locator('#role-add-button').click();
        await page.locator('#role-add-button').click();
        await page.locator('input[name="application.roles[0].name"]').fill('admin');
        await page.locator('input[name="application.roles[1].name"]').fill('customer');
        await page.locator('input[name="application.roles[0].isSuperRole"][type=checkbox]').check();
      }

      if (name === 'manage-user-actions-application-oauth') {
        await selectTab(page, 'OAuth');
        await page.locator('#client-secret-input').evaluate(el => { el.value = 'pied-piper-example-client-secret'; });
        const input = page.locator('#redirectURLs-display input');
        await input.fill('http://localhost:3000/oauth-redirect');
        await input.press('Enter');
        await page.waitForTimeout(300);
      }

      if (name === 'manage-user-actions-welcome-template') {
        const set = await page.evaluate(text => {
          const editors = [...document.querySelectorAll('main .CodeMirror')].map(e => e.CodeMirror);
          editors.forEach(cm => cm.setValue(text));
          return editors.length;
        }, 'Welcome to PiedPiper. Your subscription is valid for one month of reading.');
        if (!set) throw new Error('email template editors not found');
      }

      if (name === 'manage-user-actions-subscribe-action') await selectTab(page, 'Email');

      if (name === 'manage-user-actions-survey-action') await page.locator('#userAction_name').waitFor();

      if (name === 'manage-user-actions-reasons-button') {
        await tag('reasons-button', () => [...document.querySelectorAll('main header a')].find(a => a.textContent.trim() === 'Reasons'));
      }

      if (name === 'manage-user-actions-action-user') {
        await page.locator('header el-dropdown button').click();
        await page.locator('el-menu:has(#add-user-comment)').waitFor();
        await page.evaluate(() => {
          const menu = document.querySelector('el-menu:has(#add-user-comment)');
          const r = menu.getBoundingClientRect();
          const copy = document.createElement('div');
          copy.className = menu.className;
          copy.innerHTML = menu.innerHTML;
          copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
          document.body.append(copy);
          menu.hidePopover();
          const item = [...copy.querySelectorAll('a, button')].find(a => /^Action user$/i.test(a.textContent.trim()));
          if (item) item.dataset.hl = 'action-user';
        });
      }

      if (name === 'manage-admin-forms-registration-form') {
        await page.locator('#registration-form #id').evaluate(el => { el.value = '41b154f9-f2ff-40c6-9dc6-c9c4e8ffa02e'; });
      }

      if (name === 'manage-admin-forms-user-form' || name === 'manage-admin-forms-registration-form') {
        const key = name === 'manage-admin-forms-user-form' ? 'user.data.favoriteColor' : 'registration.data.backgroundColor';
        const field = page.locator(`main [name="${key}"]`);
        for (let i = 0; !(await field.count()); i++) {
          if (i === 30) throw new Error(`custom field not rendered: ${key}`);
          await page.waitForTimeout(500);
          await page.reload({ waitUntil: 'networkidle' });
        }
        await tag('custom-field', new Function(`return () => document.querySelector('main [name="${key}"]')?.closest('[id$=-form-row], .form-row, label, .input-addon-group') ?? document.querySelector('main [name="${key}"]')?.parentElement`)());
      }

      if (name === 'manage-admin-forms-user-form') {
        await page.evaluate(() => {
          const field = document.querySelector('[data-hl=custom-field]');
          const frame = document.createElement('div');
          frame.id = 'manage-admin-user-frame';
          frame.style.cssText = `position:absolute;left:0;top:0;width:${innerWidth}px;height:${field.getBoundingClientRect().bottom + scrollY + 24}px;pointer-events:none`;
          document.body.append(frame);
        });
      }

      if (name === 'manage-admin-forms-user-data') {
        await selectTab(page, 'User data');
        for (const key of ['favoriteColor', 'backgroundColor']) {
          await tag(key, new Function(`return () => [...document.querySelectorAll('#user-data *')].filter(e => e.textContent.trim().startsWith('${key}') && e.textContent.trim().length < 40).pop()`)());
        }
      }

      if (name === 'manage-search-about-engine') {
        await tag('system-panel', () => [...document.querySelectorAll('main h2')].find(h => h.textContent.trim() === 'System')?.closest('section, .panel, div.rounded-lg, div.bg-white'));
      }
    }

    // user manage pages for Big Head and Erlich: the Angular SPA may land on the Users
    // list before routing to the specific user -- wait for the Manage User heading.
    if (url.includes('00000000-0000-0000-0000-10000000000') && pathname.startsWith('/admin/user/manage/') && ctx?.name !== 'five-minute-registration-add') {
      try {
        await page.waitForFunction(
          () => document.querySelector('h1')?.textContent?.trim() === 'Manage User',
          { timeout: 20000 }
        ).catch(async () => {
          // retry the navigation once if Angular didn't route to the manage page
          await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
          await page.waitForFunction(
            () => document.querySelector('h1')?.textContent?.trim() === 'Manage User',
            { timeout: 15000 }
          );
        });
      } catch (e) {
        throw new Error(`manage page wait failed: ${e.message}`, { cause: e });
      }
    }

    // user and entity type tabs: click the tab named by the URL fragment
    if (fragment && /^\/admin\/(user\/manage|entity\/type\/add)/.test(pathname)) {
      await tabsReady(page);
      const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
      if (!label) throw new Error(`no tab for #${fragment}`);
      await selectTab(page, label);
      await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`).scrollIntoView({ block: 'nearest', inline: 'nearest' }), fragment);
      // this tab loads its rows when opened
      if (fragment === 'entity-grants') await page.locator('#entity-grants td').first().waitFor();
    }

    // ids FusionAuth generates on each start
    if (pathname === `/admin/user/manage/${dineshId}`) {
      const headers = { 'Authorization': apiKey };
      const { user } = await (await fetch(`http://localhost:9011/api/user/${dineshId}`, { headers })).json();
      const grants = [];
      for (const n of [1, 2]) {
        const r = await fetch(`http://localhost:9011/api/entity/00000000-0000-0000-0000-b0000000000${n}/grant?userId=${dineshId}`, { headers });
        if (r.ok) grants.push((await r.json()).grant);
      }
      const ids = [...user.registrations, ...user.memberships, ...grants].map(x => x.id);
      const methods = (user.twoFactor?.methods ?? []).map(m => m.id);
      await page.evaluate(([ids, methods]) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          let text = node.textContent;
          ids.forEach((id, i) => { text = text.replaceAll(id, `00000000-0000-0000-0000-f0000000000${i + 1}`); });
          methods.forEach((id, i) => { text = text.replaceAll(`"${id}"`, `"M${i + 1}AB"`).replace(new RegExp(`^(\\s*)${id}(\\s*)$`), `$1M${i + 1}AB$2`); });
          node.textContent = text.replace(/\b1\d{12}\b/g, '1790000000000');
        }
      }, [ids, methods]);
    }

    if (ctx?.name === 'user-search-database') {
      await page.fill('#user-search-form input[type=search], #user-search-form input[type=text]', 'jian');
      await page.locator('#user-search-form button').filter({ hasText: /Search/ }).first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    if (ctx?.name === 'entity-homepage') {
      await page.locator('main button').filter({ hasText: /Search/ }).first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }

    if (ctx?.name === 'manage-permissions') {
      await page.locator('header a').filter({ hasText: /Add/ }).first().click();
      await page.locator('.prime-dialog.open').waitFor();
    }

    // add registration screenshot: click Add registration on Erlich's manage page,
    // then select the first available application so the full form loads
    if (url.includes('00000000-0000-0000-0000-100000000003')) {
      try {
        await page.locator('a, button').filter({ hasText: /Add registration/i }).first().click({ timeout: 10000 });
        await page.waitForTimeout(1500);
        await page.locator('select').first().selectOption({ index: 1 });
        await page.waitForTimeout(2500);
        // remove focus so no field shows a browser focus ring in the screenshot
        await page.evaluate(() => document.activeElement?.blur());
        // registration form uses Angular bindings, not name attrs, for Languages --
        // walk up from the label until we find a container that also holds an input,
        // so the outline surrounds both the label and the field.
        await page.evaluate(() => {
          const label = [...document.querySelectorAll('label')]
            .find(l => /^Languages\b/.test(l.textContent.trim()));
          if (!label) return;
          // stop at the <form> boundary so the nav sidebar's selects don't pull
          // the walk all the way up to app-root, which would outline the full page
          const formBoundary = label.closest('form') || document.body;
          let container = label.parentElement;
          while (container && container !== formBoundary) {
            if (container.querySelector('input, select, textarea, a-tokenizer, [class*="token"], [class*="chosen"]')) break;
            container = container.parentElement;
          }
          if (container && container !== formBoundary && container !== document.body) {
            container.style.cssText += '; outline: 2px solid #f26522; outline-offset: 4px; border-radius: 2px;';
          }
        });
      } catch (e) {
        throw new Error(`registration setup failed: ${e.message}`, { cause: e });
      }
    }

    // application edit: click the tab named by the URL fragment, or Security
    if (pathname.includes('/admin/application/edit') || (pathname.includes('/admin/application/add') && fragment)) {
      await page.waitForTimeout(500);
      try {
        await tabsReady(page);
        const appTab = !fragment ? 'Security'
          : await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
        if (!appTab) throw new Error(`no tab for #${fragment}`);
        await selectTab(page, appTab);
        await page.locator('button').filter({ hasText: appTab }).first().click({ timeout: 3000 });
        await page.waitForTimeout(1000);
        await selectTab(page, appTab);
      } catch (e) {
        throw new Error(`application/edit tab failed: ${e.message}`, { cause: e });
      }
    }

    // tenant edit: click the tab named by the URL fragment
    if (pathname.includes('/admin/tenant/edit/') && fragment) {
      await tabsReady(page);
      const tabLabel = { email: 'Email', 'email-test': 'Email', identities: 'Identities', passwordless: 'Advanced', webauthn: 'WebAuthn' }[fragment]
        ?? await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
      if (tabLabel) {
        try {
          await selectTab(page, tabLabel);
          // use JS click to handle tabs that are scrolled off the visible tab bar
          const result = await page.evaluate((label) => {
            const btns = [...document.querySelectorAll('el-tab-list button')];
            const allLabels = btns.map(b => b.textContent.trim());
            const btn = btns.find(b => b.textContent.trim() === label);
            if (btn) {
              btn.click();
              // bring a tab scrolled out of the tab bar into view
              const bar = btn.closest('.tab-list-container');
              const b = btn.getBoundingClientRect(), r = bar?.getBoundingClientRect();
              if (r && b.right > r.right) bar.scrollLeft += b.right - r.right + 16;
              else if (r && b.left < r.left) bar.scrollLeft -= r.left - b.left + 16;
              return { clicked: true };
            }
            return { clicked: false, available: allLabels };
          }, tabLabel);
          if (!result.clicked) throw new Error(`tab "${tabLabel}" not found; available: ${JSON.stringify(result.available)}`);
          await page.waitForTimeout(1000);
          await selectTab(page, tabLabel);
        } catch (e) {
          throw new Error(`tenant/edit ${tabLabel} tab failed: ${e.message}`, { cause: e });
        }
      }

      // send-test-email screenshot: tag and scroll to the test email control
      if (ctx?.name === 'tenant-send-test-email') {
        const tagged = await page.evaluate(() => {
          const btn = [...document.querySelectorAll('a, button')]
            .find(el => /send test email/i.test(el.textContent.trim()));
          if (!btn) return false;
          const row = btn.closest('fieldset, .form-row, div') ?? btn;
          row.setAttribute('data-hl', 'send-test-email');
          row.scrollIntoView({ block: 'center', behavior: 'instant' });
          return true;
        });
        if (!tagged) throw new Error('send test email control not found');
        await page.waitForTimeout(300);
      }

      // webauthn tab: click enable toggle only if workflow fieldsets aren't already visible
      // (beforeAll enables WebAuthn when a license key is present; clicking again would disable it)
      if (fragment === 'webauthn') {
        await page.evaluate(() => {
          const alreadyEnabled = !!document.querySelector('#tenant_webAuthnConfiguration_bootstrapWorkflow_enabled-form-row');
          if (!alreadyEnabled) {
            const label = document.querySelector('#tenant_webAuthnConfiguration_enabled-form-row label');
            if (label) label.click();
          }
        });
        await page.waitForTimeout(400);
      }

      // email-config screenshot: tag and scroll to the Passwordless login row in the Email column
      if (ctx?.name === 'passwordless-tenant-email-config') {
        await page.evaluate(() => {
          const sel = document.querySelector('#tenant_emailConfiguration_passwordlessEmailTemplateId');
          if (!sel) return;
          const innerFieldset = sel.closest('fieldset');
          if (!innerFieldset) return;
          let cell = sel.parentElement;
          while (cell && cell.parentElement !== innerFieldset) cell = cell.parentElement;
          if (cell) {
            cell.setAttribute('data-hl', 'pw-email-template');
            cell.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        });
        await page.waitForTimeout(300);
      }

      // message-config screenshot: tag and scroll to the Passwordless login row in the Phone column
      if (ctx?.name === 'passwordless-tenant-message-config') {
        await page.evaluate(() => {
          const sel = document.querySelector('#tenant_phoneConfiguration_passwordlessTemplateId');
          if (!sel) return;
          const innerFieldset = sel.closest('fieldset');
          if (!innerFieldset) return;
          let cell = sel.parentElement;
          while (cell && cell.parentElement !== innerFieldset) cell = cell.parentElement;
          if (cell) {
            cell.setAttribute('data-hl', 'pw-message-template');
            cell.scrollIntoView({ block: 'center', behavior: 'instant' });
          }
        });
        await page.waitForTimeout(300);
      }

      // generation screenshot: expand the Warning accordion so the generation rows exist in DOM
      if (ctx?.name === 'passwordless-tenant-generation') {
        try {
          await page.locator('button, [role="button"], summary, a').filter({ hasText: /Warning/ }).first().click({ timeout: 5000 });
          await page.waitForTimeout(500);
        } catch (e) {
          throw new Error(`Warning accordion expand failed: ${e.message}`, { cause: e });
        }
      }
    }

    // email template edit: click the Localization inner tab
    if (pathname.includes('/admin/email/template/edit/') && fragment === 'localization') {
      try {
        const clicked = await page.evaluate(() => {
          const els = [...document.querySelectorAll('a, button, [role="tab"]')];
          const el = els.find(e => e.textContent.trim() === 'Localization');
          if (el) { el.click(); return true; }
          return false;
        });
        if (!clicked) throw new Error('Localization tab element not found');
        await page.waitForTimeout(800);
        // tag the Add localization button for highlighting
        await page.evaluate(() => {
          const btn = [...document.querySelectorAll('a, button')].find(el => /add localization/i.test(el.textContent));
          if (btn) btn.setAttribute('data-hl', 'add-localization');
        });
      } catch (e) {
        throw new Error(`email/template/edit localization tab failed: ${e.message}`, { cause: e });
      }
    }

    // oauth login page: click "Login with a magic link" to show the email request form
    if (pathname.includes('/oauth2/authorize') && fragment === 'email-request') {
      try {
        await page.locator('a, button').filter({ hasText: /magic link/i }).first().click({ timeout: 5000 });
        await page.waitForTimeout(1000);
      } catch (e) {
        throw new Error(`oauth magic link click failed: ${e.message}`, { cause: e });
      }
    }

    // phone-otp: navigate to the passwordless form, enter an identifier, and submit
    // to land on the OTP code-entry form (FormField strategy for phone passwordless)
    if (pathname.includes('/oauth2/authorize') && fragment === 'phone-otp') {
      try {
        await page.goto(`http://localhost:9011/oauth2/passwordless?client_id=${oauthAppId}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-callback&response_type=code&scope=openid`);
        await page.waitForLoadState('networkidle');
        // Big Head has mobilePhone in kickstart -- enter it to trigger the phone OTP flow
        await page.fill('#loginId', '+15555551234');
        // the passwordless form submit is a plain <button> with text "Send" -- no type or id attr
        await page.locator('form[action="/oauth2/passwordless"] button').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      } catch (e) {
        throw new Error(`phone otp flow failed: ${e.message}`, { cause: e });
      }
    }

    // migrate users section
    if (ctx?.name?.startsWith('migration-') || ctx?.name?.startsWith('scim-sdk-')) await migrationBeforeSizing(page, ctx.name, tag);
    // identity providers
    const idpShot = idpShots[ctx?.name];
    if (idpShot) {
      if ('login' in idpShot) {
        const target = idpShot.login && idpId(idpShot.login);
        // FusionAuth picks up new applications and IdPs after a delay
        for (let i = 0; ; i++) {
          const ready = await page.evaluate(t => t ? !!document.querySelector(`.login-button[data-identity-provider-id="${t}"]`)
            : !!document.querySelector('#loginId') && !document.querySelector('#password'), target);
          if (ready) break;
          if (i === 120) throw new Error(`login page for ${ctx.name} not ready`);
          await page.waitForTimeout(1000);
          await page.goto(url, { waitUntil: 'networkidle' });
        }
        // every IdP is enabled for PiperChat, so leave only the one the guide sets up
        if (target) {
          await page.evaluate(t => {
            for (const button of document.querySelectorAll('.login-button')) {
              if (button.dataset.identityProviderId === t) continue;
              let el = button;
              while (el.parentElement.children.length === 1) el = el.parentElement;
              el.remove();
            }
          }, target);
        }
      }

      if (pathname.startsWith('/admin/identity-provider/') && fragment) {
        await tabsReady(page);
        await page.locator(`el-tab-list button[aria-controls="${fragment}"]`).waitFor();
        const label = await page.evaluate(id => document.querySelector(`el-tab-list button[aria-controls="${id}"]`)?.textContent.trim(), fragment);
        if (!label) throw new Error(`no tab for #${fragment}`);
        await selectTab(page, label);
      }

      // FusionAuth shows these ids as numbers
      if (pathname.startsWith('/admin/identity-provider/edit/')) {
        await page.evaluate(id => document.querySelectorAll('input#identityProviderId').forEach(i => { i.value = id; }), pathname.split('/').pop());
      }

      if (idpShot.fill?.identityProvider_oauth2_issuer) {
        await page.locator('#useOpenIdDiscovery').check();
        await page.waitForTimeout(300);
        await page.evaluate(() => {
          const issuer = document.getElementById('issuer-configuration');
          issuer.classList.remove('hidden');
          issuer.classList.add('open');
          issuer.style.cssText = 'display:block!important;height:auto!important;max-height:none!important';
          document.getElementById('issuer-endpoint-configuration').style.setProperty('display', 'none', 'important');
        });
        await page.locator('#identityProvider_oauth2_issuer').waitFor({ state: 'visible' });
      }

      for (const [id, value] of Object.entries(idpShot.fill ?? {})) {
        const filled = await page.evaluate(([i, v]) => {
          const input = document.getElementById(i);
          if (!input) return false;
          input.value = v;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }, [id, value]);
        if (!filled) throw new Error(`field not found: ${id}`);
      }

      if (pathname === '/admin/identity-provider/') {
        await page.evaluate(({ warning, rowId, menu }) => {
          const warnings = [...document.querySelectorAll('main fieldset')].filter(el => el.querySelector('legend'));
          for (const section of warnings) {
            if (section.querySelector('legend').textContent.trim() !== warning) section.remove();
          }
          const heading = [...document.querySelectorAll('main h2')].find(el => el.textContent.includes('Action required'));
          if (!warning) heading?.closest('.panel')?.remove();
          for (const row of document.querySelectorAll('main table.listing tbody > tr')) {
            if (rowId && !row.textContent.includes(rowId)) row.remove();
            else if (menu) row.remove();
          }
        }, { warning: ({ 'idp-cors-warning-okta': 'Okta SAML', 'idp-cors-warning-samlv2': 'Pied Piper SAML', 'idp-cors-warning-apple': 'Apple' })[ctx.name], rowId: idpShot.rowMenu && idpId(idpShot.rowMenu), menu: !!idpShot.menu });
      }

      if (ctx.name === 'idp-app-oauth') {
        await page.evaluate(id => { document.querySelector('#applicationId').value = id; }, piperChatId);
      }

      if (idpShot.menu || idpShot.keyMenu || idpShot.rowMenu) {
        const href = idpShot.menu ?? (idpShot.keyMenu ? `/ajax/key/import?t=${idpShot.keyMenu}` : `/ajax/identity-provider/view/${idpId(idpShot.rowMenu)}`);
        await tag('idp-menu-item', new Function(`return () => {
          const item = document.querySelector('main a[href="${href}"]');
          item?.closest('[popover]')?.showPopover();
          return item;
        }`)());
        await page.waitForTimeout(500);
      }

      if (idpShot.view || idpShot.appView || idpShot.keyImport || idpShot.claimDialog) {
        const href = idpShot.view ? `/ajax/identity-provider/view/${idpId(idpShot.view)}` : idpShot.appView ? `/ajax/application/view/${idpShot.appView}`
          : idpShot.keyImport ? `/ajax/key/import?t=${idpShot.keyImport.t}` : '/ajax/identity-provider/claim/add';
        await page.evaluate(h => {
          const link = document.querySelector(`main a[href="${h}"]`);
          link?.closest('[popover]')?.showPopover();
          link?.click();
        }, href);
        await page.locator('.prime-dialog.open').waitFor();
        await page.waitForTimeout(800);
        await page.evaluate(() => {
          const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll('http://localhost:9011', 'https://local.fusionauth.io');
        });
      }

      if (idpShot.view) {
        await page.evaluate(() => {
          const order = ['PiperChat', 'PiperNet', 'Tenant manager', 'Pied Piper', 'FusionAuth'];
          for (const body of document.querySelectorAll('.prime-dialog.open tbody')) {
            const rows = [...body.children].filter(row => row.tagName === 'TR');
            const name = row => row.querySelector('td')?.textContent.trim();
            if (!rows.some(row => name(row) === 'PiperChat') || !rows.every(row => order.includes(name(row)))) continue;
            rows.sort((a, b) => order.indexOf(name(a)) - order.indexOf(name(b))).forEach(row => body.append(row));
          }
        });
      }

      if (idpShot.appView) {
        await page.addStyleTag({ content: '.prime-dialog.open td, .prime-dialog.open a { overflow-wrap: anywhere; }' });
      }

      // a heading or row label in the dialog, scrolled to and highlighted
      const dialogTarget = idpShot.viewBox ?? (idpShot.appView && 'OAuth IdP login URL');
      if (dialogTarget) {
        await tag('idp-dialog-section', new Function(`return () => {
          const dialog = document.querySelector('.prime-dialog.open');
          const label = [...dialog.querySelectorAll('*')].find(el => el.children.length === 0 && el.textContent.trim().replace(/:$/, '') === ${JSON.stringify(dialogTarget)});
          const section = label?.closest('tr') ?? label?.parentElement;
          if (!section) return null;
          let scroller = section.parentElement;
          while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
          if (scroller) scroller.scrollTop += section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
          if (label.tagName !== 'H3') return section;
          const bottom = section.nextElementSibling?.nextElementSibling;
          if (!bottom) return null;
          const a = section.getBoundingClientRect(), b = bottom.getBoundingClientRect();
          const box = document.createElement('div');
          box.style.cssText = 'position:fixed;pointer-events:none;left:' + (a.left - 6) + 'px;top:' + (a.top - 6) + 'px;width:' + (a.width + 12) + 'px;height:' + (b.bottom - a.top + 12) + 'px';
          document.body.append(box);
          return box;
        }`)());
      }

      if (idpShot.keyImport) {
        const { name, kid, pem } = idpShot.keyImport;
        const set = await page.evaluate(([n, k, p]) => {
          const dialog = document.querySelector('.prime-dialog.open');
          for (const [id, v] of [['key_name', n], ['key_kid', k]]) if (v) dialog.querySelector(`#${id}`).value = v;
          if (p) dialog.querySelector('.CodeMirror')?.CodeMirror.setValue(p);
          return !p || !!dialog.querySelector('.CodeMirror');
        }, [name, kid, pem]);
        if (!set) throw new Error('key editor not found');
      }

      // the Tenant manager application and the default keys get new ids on each start
      if (pathname === '/admin/application/' || pathname === '/admin/key/') {
        await page.evaluate(() => {
          let n = 900;
          for (const td of document.querySelectorAll('main td')) {
            const text = td.textContent.trim();
            if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(text) && !text.startsWith('00000000-')) td.textContent = `00000000-0000-0000-0000-f2${String(n++).padStart(10, '0')}`;
          }
        });
      }

      if (idpShot.cors) {
        await page.evaluate(() => {
          for (const box of document.querySelectorAll('input[id^="corsConfiguration.allowedMethods-"]')) if (['GET', 'POST'].includes(box.value) && !box.checked) box.click();
        });
        await page.locator('#cors-allowed-origins-display input').fill(idpShot.cors);
        await page.keyboard.press('Enter');
        await page.evaluate(() => document.activeElement?.blur());
      }

      if (idpShot.appRow) {
        await tag('idp-app-row', new Function(`return () => [...document.querySelectorAll('#applications tr')].find(tr => tr.querySelector('td')?.textContent.trim() === ${JSON.stringify(idpShot.appRow)})`)());
      }

      if (idpShot.overrides) {
        await tag('idp-overrides', new Function(`return () => {
          const link = document.querySelector('a[data-expand-open="${idpShot.overrides}-advanced"]');
          link?.click();
          return link;
        }`)());
        await page.waitForTimeout(800);
      }

      if (idpShot.tenantConfig) {
        await tag('idp-tenants', () => document.querySelector('#tenants table'));
      }

      if (idpShot.claimDialog) await page.evaluate(() => document.activeElement?.blur());

      if (idpShot.listbox) {
        // a native select's open list doesn't render in a screenshot, so show it as a list box
        await tag('idp-listbox', new Function(`return () => {
          const select = document.getElementById(${JSON.stringify(idpShot.listbox)});
          if (!select) return null;
          select.value = 'CreatePendingLink';
          select.size = select.options.length;
          select.style.height = 'auto';
          select.style.backgroundImage = 'none';
          return select;
        }`)());
      }

      if (idpShot.scroll) {
        const marked = await page.evaluate(id => {
          const el = document.querySelector(`main label[for="${id}"]`) ?? document.getElementById(id);
          if (el) el.dataset.idpScroll = '';
          return !!el;
        }, idpShot.scroll);
        if (!marked) throw new Error(`scroll target not found: ${idpShot.scroll}`);
      }

      // one box per field, around its label and input
      for (const [i, field] of (idpShot.box ?? []).entries()) {
        await tag(`idp-box-${i + 1}`, new Function(`return () => {
          const field = ${JSON.stringify(field)};
          let els;
          if (field === 'key-pem') els = [document.querySelector('.prime-dialog.open .CodeMirror')];
          else if (field === 'cors-allowed-origins') els = [document.querySelector("label[for='cors-allowed-origins']"), document.querySelector('#cors-allowed-origins-display')];
          else if (field === 'verification-keys') {
            const label = [...document.querySelectorAll('main label, main p, main span')].find(el => el.children.length === 0 && el.textContent.trim() === 'Verification keys');
            els = [label, document.querySelector('main table:has(#samlv2VerificationKeyIds-input), main table:has(select[name*="keyId"])')];
          } else {
            const input = document.getElementById(field);
            els = [document.querySelector('label[for="' + field + '"]'), input];
          }
          els = els.filter(Boolean);
          if (!els.length) return null;
          const rects = els.map(el => el.getBoundingClientRect());
          const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
          const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
          const box = document.createElement('div');
          box.style.cssText = 'position:' + (document.querySelector('.prime-dialog.open') ? 'fixed' : 'absolute') + ';pointer-events:none;left:' + (left + (document.querySelector('.prime-dialog.open') ? 0 : scrollX) - 6) + 'px;top:' + (top + (document.querySelector('.prime-dialog.open') ? 0 : scrollY) - 6) + 'px;width:' + (right - left + 12) + 'px;height:' + (bottom - top + 12) + 'px';
          document.body.append(box);
          return box;
        }`)());
      }
    }

    // Register users and user support.
    if (registerNames.includes(ctx?.name)) {
      const name = ctx.name.slice('register-'.length);
      if (['new-user-listing', 'users-tab'].includes(name)) {
        await page.fill('#s_queryString', name === 'new-user-listing' ? 'carla' : 'dinesh');
        await page.locator('#user-search-form button').filter({ hasText: /Search/ }).first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
      }
      const fieldExample = { 'minimum-price-form-field': 0, 'geographic-area-form-field': 2, 'add-custom-field': 3, 'hidden-field': 4 }[name];
      if (fieldExample !== undefined) {
        const { field } = await apiRequest(`/api/form/field/${registerFields[fieldExample]}`);
        await page.fill('#field_name', field.name);
        const registration = field.key.startsWith('registration.');
        await page.selectOption('#field_key', { label: registration ? 'Custom registration data (registration.data.*)' : 'Custom user data (user.data.*)' });
        await page.fill(registration ? '#registration-data-key' : '#user-data-key', field.key.split('.').slice(2).join('.'));
        await page.selectOption('select#field_control', field.control);
        await page.selectOption('select#field_type', field.type);
        if (field.required) await page.locator('label[for=field_required]').click();
      }
      if (name === 'new-form') await page.fill('#form_name', 'Real estate search registration form');
      if (['find-registration-url', 'registration-url'].includes(name)) {
        const id = name === 'registration-url' ? registerIds.basic : registerIds.app;
        await page.evaluate(id => {
          const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
          link?.closest('[popover]')?.showPopover();
          link?.click();
        }, id);
        await page.locator('.prime-dialog.open').waitFor();
        await page.waitForTimeout(500);
        await tag('register-url', () => {
          const row = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Registration URL/.test(r.textContent.trim()));
          row?.scrollIntoView({ block: 'center' });
          return row;
        });
        await page.evaluate(() => {
          const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll('http://localhost:9011', 'https://local.fusionauth.io');
        });
      }
      if (name === 'update-theme-for-tenant') await page.selectOption('#tenant_themeId', registerIds.theme);
      if (name === 'complete-registration-settings') {
        await page.selectOption('#selfRegistrationType', 'Complete');
      }
      if (name === 'new-user-data-display') {
        await tag('register-data', () => document.querySelector('#user-data fieldset:last-child > div'));
      }
      if (name === 'setup-locale-selection') {
        await tag('register-locale', () => [...document.querySelectorAll('main tr')].reverse().find(r => r.textContent.includes('Preferred languages')));
      }
      if (['first-step-no-placeholder', 'first-step-with-placeholder', 'first-step-with-placeholder-and-labels', 'register-new-user', 'login-page'].includes(name)) {
        const context = page.context();
        savedSso ??= (await context.cookies('http://localhost:9011')).find(c => c.name === 'fusionauth.sso');
        await context.clearCookies({ name: 'fusionauth.sso' });
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.locator('form input:not([type=hidden])').first().waitFor();
        if (name.startsWith('first-step-')) {
          const labels = name === 'first-step-with-placeholder-and-labels';
          for (let i = 0; labels !== await page.locator('label[for="user_email"]').isVisible(); i++) {
            if (i === 60) throw new Error('Registration theme labels did not update');
            await page.waitForTimeout(500);
            await page.reload({ waitUntil: 'networkidle' });
          }
        }
        if (name === 'first-step-no-placeholder') {
          await page.evaluate(() => {
            for (const input of document.querySelectorAll('form input[placeholder]')) input.placeholder = input.name;
          });
        }

      }
      if (name === 'new-user-form') {
        await page.locator('label[for=sendSetPasswordIdentityType-doNotSend]').click();
        await page.fill('#user_username', 'carla');
        await page.fill('#user_email', 'carla@piedpiper.com');
        await page.fill('#user_password', 'password');
        await page.fill('#confirm_user_password', 'password');
      }
      if (['limited-menu', 'user-edit-screen', 'registration-edit-screen'].includes(name)) {
        registerCookies = await page.context().cookies();
        await page.context().clearCookies();
        await page.goto('http://localhost:9011/admin/login', { waitUntil: 'networkidle' });
        await page.fill('#loginId', 'jared@piedpiper.com');
        await page.fill('#password', 'password');
        await page.keyboard.press('Enter');
        await page.waitForURL(u => u.pathname.startsWith('/admin') && !u.pathname.includes('/admin/login'));
        await page.goto(url, { waitUntil: 'networkidle' });
      }
      if (['require-password-change', 'lock-account', 'unlock-account', 'add-comment', 'confirm-change', 'confirm-lock', 'confirm-unlock', 'write-comment'].includes(name)) {
        const text = {
          'require-password-change': 'Require password change', 'confirm-change': 'Require password change',
          'lock-account': 'Lock account', 'confirm-lock': 'Lock account',
          'unlock-account': 'Unlock account', 'confirm-unlock': 'Unlock account',
          'add-comment': 'Add a comment', 'write-comment': 'Add a comment',
        }[name];
        await page.locator('header el-dropdown button').click();
        const target = page.locator('el-menu a, el-menu button').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`, 'i') }).first();
        await target.waitFor({ state: 'visible' });
        if (['confirm-change', 'confirm-lock', 'confirm-unlock', 'write-comment'].includes(name)) {
          await target.click();
          await page.locator('.prime-dialog.open').waitFor();
          if (name === 'write-comment') await page.locator('.prime-dialog.open textarea').fill('Customer requested help updating their profile.');
        } else {
          await target.evaluate(el => el.dataset.hl = 'register-menu-target');
          await page.evaluate(() => {
            const menu = document.querySelector('el-menu:has([data-hl="register-menu-target"])');
            const r = menu.getBoundingClientRect();
            const copy = document.createElement('div');
            copy.className = menu.className;
            copy.innerHTML = menu.innerHTML;
            copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
            document.body.append(copy);
            menu.hidePopover();
            menu.querySelector('[data-hl]').removeAttribute('data-hl');
          });
        }
      }
      if (['select-application', 'roles'].includes(name)) {
        await page.locator('select').first().waitFor();
        if (name === 'roles') {
          await page.locator('select').first().selectOption({ label: 'FusionAuth' });
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(800);
          const role = page.locator('input[value=user_support_manager]');
          await role.check();
          await role.evaluate(el => el.parentElement.dataset.hl = 'register-support-role');
        }
      }
      if (name === 'remove-user-action') {
        await page.locator('#current-actions el-dropdown button').first().click();
        await page.locator('#current-actions a[href^="/ajax/user/cancel-action/"]').first().waitFor({ state: 'visible' });
      }
      if (name === 'confirm-action-cancellation') {
        await page.locator('main img').evaluateAll(async images => {
          await Promise.all(images.map(async image => { image.loading = 'eager'; await image.decode().catch(() => {}); }));
        });
        await page.locator('#current-actions a[href^="/ajax/user/cancel-action/"]').first().evaluate(el => { el.closest('[popover]')?.showPopover(); el.click(); });
        await page.locator('.prime-dialog.open').waitFor();
      }
      if (pathname.includes(registerIds.user)) {
        const { user } = await apiRequest(`/api/user/${registerIds.user}`);
        await page.evaluate(ids => {
          const stable = id => `00000000-0000-0000-0000-f5000000002${ids.indexOf(id)}`;
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            for (const id of ids) node.textContent = node.textContent.replaceAll(id, stable(id));
          }
          for (const input of document.querySelectorAll('input')) if (ids.includes(input.value)) input.value = stable(input.value);
        }, user.registrations.map(r => r.id));
      }
      if (name === 'hidden-field' || name === 'new-user-form') {
        await page.waitForTimeout(300);
        await page.evaluate(id => {
          for (let panel = document.getElementById(id); panel && panel.tagName !== 'FORM'; panel = panel.parentElement) {
            if (!panel.classList.contains('slide-open')) continue;
            panel.classList.remove('hidden');
            panel.classList.add('open');
            panel.style.removeProperty('display');
            panel.style.setProperty('height', 'auto', 'important');
            panel.style.setProperty('max-height', 'none', 'important');
          }
        }, name === 'hidden-field' ? 'user-data-key' : 'user_password');
      }
      await page.evaluate(() => window.scrollTo(0, 0));
    }

    if (ctx?.name === 'theme-localization-messages') {
      // viewport is already set to spec.height by capture.mjs before this hook runs.
      // scroll down to reach the Add Localization button (below the fold), click it,
      // then scroll back to top -- position:fixed dialog stays centred in the viewport.
      await page.waitForTimeout(2000); // code editor initialization takes time
      try {
        // wait for Angular to render the theme editor tab list before clicking Messages.
        // tabs are <a> elements; text includes trailing icon chars so use startsWith.
        // "Message Templates" in the nav starts with "Message" (no s) -- won't match.
        await page.waitForFunction(
          () => [...document.querySelectorAll('button, [role="tab"], a')].some(el => /^Messages\b/.test(el.textContent.trim())),
          null,
          { timeout: 20000 }
        );
        await page.evaluate(() => {
          const candidates = [...document.querySelectorAll('button, [role="tab"], a')]
            .filter(el => /^Messages\b/.test(el.textContent.trim()));
          // prefer the shortest match to avoid "Message Templates" nav link if regex somehow matches
          const btn = candidates.sort((a, b) => a.textContent.trim().length - b.textContent.trim().length)[0];
          if (btn) btn.click();
        });
        await page.waitForTimeout(1500);
        // scroll down far enough to bring Add Localization into the viewport
        const docH = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate((h) => window.scrollTo(0, h), docH);
        await page.waitForTimeout(300);
        await page.getByText(/Add Localization/i).first().click({ timeout: 5000 });
        await page.waitForTimeout(800);
        // scroll back to top -- the fixed dialog stays centred in the viewport
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(200);
        // a 2px empty div (class "border") sits at y=0, pushing the sticky header to y=2.
        // under the dialog backdrop this gap appears as a black bar. zero it out.
        await page.evaluate(() => {
          [...document.querySelectorAll('div')].filter(el => {
            const r = el.getBoundingClientRect();
            return r.top === 0 && r.height > 0 && r.height <= 3 && el.children.length === 0;
          }).forEach(el => {
            el.style.cssText += '; height:0 !important; min-height:0 !important; border:none !important; padding:0 !important; margin:0 !important;';
          });
        });
      } catch (e) {
        throw new Error(`theme/edit setup failed: ${e.message}`, { cause: e });
      }
    } else {
      // expand the viewport to fit the full inner-scroll content height;
      // this makes fullPage equivalent to a single viewport capture so fixed
      // elements stay at top: 0 rather than rendering at the wrong scroll offset.
      // cap at 2500px to avoid exploding on code-editor pages with huge scroll heights.
      const fullHeight = await page.evaluate(() => {
        return [...document.querySelectorAll('*')].reduce((max, el) => {
          const s = window.getComputedStyle(el);
          if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > max) {
            return el.scrollHeight;
          }
          return max;
        }, document.documentElement.scrollHeight);
      });
      if (fullHeight > 800 && !(ctx?.name in fixedHeight) && !(ctx?.name in bands)) {
        await page.setViewportSize({ width: page.viewportSize().width, height: Math.min(fullHeight, 2500) });
        await page.waitForTimeout(300);
      }
    }

    await page.evaluate(keep => {
      if (!keep) document.querySelectorAll('.alert, [role=alert], .notification').forEach(el => el.remove());
      document.activeElement?.blur();
    }, keepAlerts.includes(ctx?.name));

    // lets selectors name a form section by its heading, e.g. [data-section='email-settings']
    await page.evaluate(() => {
      for (const legend of document.querySelectorAll('main legend')) {
        const title = legend.textContent.trim().split('\n')[0].trim();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        // a container can hold more than one section, so tag the heading and what follows it
        for (let el = legend; el && (el === legend || el.tagName !== 'LEGEND'); el = el.nextElementSibling) {
          el.dataset.section = slug;
        }
      }
    });

    if (sectionBoxes[ctx?.name]) {
      const boxed = await page.evaluate(section => {
        const rects = [...document.querySelectorAll(`[data-section='${section}']`)].filter(el => el.offsetParent).map(el => el.getBoundingClientRect());
        if (!rects.length) return false;
        const top = Math.min(...rects.map(r => r.top)), bottom = Math.max(...rects.map(r => r.bottom));
        const left = Math.min(...rects.map(r => r.left)), right = Math.max(...rects.map(r => r.right));
        const box = document.createElement('div');
        box.dataset.hl = 'section-box';
        box.style.cssText = `position:absolute;left:${left + scrollX - 12}px;top:${top + scrollY - 12}px;width:${right - left + 24}px;height:${bottom - top + 24}px;pointer-events:none`;
        document.body.append(box);
        return true;
      }, sectionBoxes[ctx.name]);
      if (!boxed) throw new Error(`section not found: ${sectionBoxes[ctx.name]}`);
    }

    // Manage users: measure the registration strip after tab selection has finished.
    {
      const name = ctx?.name;
      if (name === 'manage-verification-application-self-service' || name === 'manage-verification-application-self-service-phone') {
        await selectTab(page, 'Registration');
        await page.evaluate(() => {
          const heading = [...document.querySelectorAll('main legend')].find(el => el.textContent.trim().startsWith('Self-service registration'));
          const row = document.querySelector('#registration-configuration tbody tr:has(td)');
          if (!heading || !row) throw new Error('self-service registration section not found');
          const top = heading.getBoundingClientRect().top + scrollY;
          const bottom = row.getBoundingClientRect().bottom + scrollY;
          const strip = document.createElement('div');
          strip.id = 'manage-self-service-strip';
          strip.style.cssText = `position:absolute;left:0;top:${top}px;width:${innerWidth}px;height:${bottom - top}px;pointer-events:none`;
          document.body.append(strip);
        });
      }

    }

    // marks the strip for crop="#screenshot-band"
    if (bands[ctx?.name]) {
      const height = await page.evaluate(sel => {
        const rects = [...document.querySelectorAll(sel)].filter(el => el.offsetParent).map(el => el.getBoundingClientRect());
        if (!rects.length) return 0;
        const top = Math.min(...rects.map(r => r.top)) + window.scrollY - 16;
        const bottom = Math.max(...rects.map(r => r.bottom)) + window.scrollY + 16;
        const band = document.createElement('div');
        band.id = 'screenshot-band';
        band.style.cssText = `position:absolute;left:0;top:${top}px;width:${document.documentElement.clientWidth}px;height:${bottom - top}px;opacity:0;pointer-events:none`;
        document.body.append(band);
        return bottom - top;
      }, bands[ctx.name]);
      if (!height) throw new Error(`band selector matched nothing: ${bands[ctx.name]}`);
      // a window just taller than the strip keeps the sticky sidebar beside it
      await page.setViewportSize({ width: page.viewportSize().width, height: Math.max(800, Math.ceil(height) + 160) });
    }

    if (fixedHeight[ctx?.name]) {
      const scrolled = await page.evaluate(target => {
        const el = (/^[\[#.]/.test(target) && document.querySelector(target))
          || [...document.querySelectorAll('main legend')].find(l => l.offsetParent && l.textContent.trim().startsWith(target));
        // leave room for the sticky top bar
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 88);
        return !!el;
      }, fixedHeight[ctx.name]);
      if (!scrolled) throw new Error(`section not found: ${fixedHeight[ctx.name]}`);
      await page.waitForTimeout(300);
    }

    // Manage users: user tabs can scroll the identity above the viewport during initialization.
    if (ctx?.name?.startsWith('manage-pre-verification-user-')) {
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('*').forEach(el => { if (el.scrollTop) el.scrollTop = 0; });
      });
      await page.waitForTimeout(300);
    }

    // pin run-time dates; a day over 12 shows the dd/mm order
    if (new URL(page.url()).pathname.startsWith('/admin')) {
      await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          node.textContent = node.textContent
            .replace(/\b\d{2}\/\d{2}\/\d{4}\b/g, '24/09/2026')
            .replace(/\b\d{2}:\d{2}(:\d{2}(,\d{3})?)? (AM|PM)\b/g, (m, seconds, millis) => `09:00${seconds ? ':00' : ''}${millis ? ',000' : ''} AM`);
        }
      });
    }

    // the menu can close before the capture, so leave a plain copy of it in its place
    if (ctx?.name === 'user-dropdown') {
      await page.locator('header el-dropdown button').click();
      await page.locator('el-menu:has(#add-user-comment)').waitFor();
      await page.evaluate(() => {
        const menu = document.querySelector('el-menu:has(#add-user-comment)');
        const r = menu.getBoundingClientRect();
        const copy = document.createElement('div');
        copy.className = menu.className;
        copy.innerHTML = menu.innerHTML;
        copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
        document.body.append(copy);
        menu.hidePopover();
      });
    }

    // migrate users section
    if (ctx?.name?.startsWith('migration-') || ctx?.name?.startsWith('scim-sdk-')) await migrationAfterSizing(page, ctx.name, tag, ctx.highlights);
    if (ctx?.name === 'idp-cors-settings') {
      await page.setViewportSize({ width: page.viewportSize().width, height: 1297 });
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        document.querySelectorAll('*').forEach(el => { if (el.scrollTop) el.scrollTop = 0; });
        const label = document.querySelector("label[for='cors-allowed-origins']");
        const input = document.querySelector('#cors-allowed-origins-display');
        const box = document.querySelector('[data-hl="idp-box-1"]');
        const a = label.getBoundingClientRect(), b = input.getBoundingClientRect();
        box.style.top = `${a.top + scrollY - 6}px`;
        box.style.height = `${b.bottom - a.top + 12}px`;
      });
    }

    if (ctx?.name === 'register-remove-user-action') {
      await page.evaluate(() => {
        const menu = document.querySelector('#current-actions [popover]');
        menu.showPopover();
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

    // identity providers: the same for the open menus
    if (idpShot?.menu || idpShot?.keyMenu || idpShot?.rowMenu) {
      await page.evaluate(() => {
        const item = document.querySelector("[data-hl='idp-menu-item']");
        const menu = item.closest('[popover]');
        Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
        const r = menu.getBoundingClientRect();
        const copy = document.createElement('div');
        copy.className = menu.className;
        copy.innerHTML = menu.innerHTML;
        copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000`;
        delete item.dataset.hl;
        document.body.append(copy);
        menu.hidePopover();
      });
    }
  },
};
