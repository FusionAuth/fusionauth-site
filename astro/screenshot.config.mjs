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
const signedOut = ['lambda-registration-blank', 'lambda-registration-invalid', 'five-minute-login', 'migration-user-login'];

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
};

// chosen (not saved) before the switches above
const selects = {
  'application-registration-self-service': { selfRegistrationType: 'Create' },
  'application-registration-self-service-basic': { selfRegistrationType: 'Complete' },
  'application-registration-self-service-advanced': { selfRegistrationType: 'Complete' },
  'multi-tenant-control-plane-registration': { selfRegistrationType: 'Create' },
  'account-application-self-service-form': { application_formConfiguration_selfServiceFormId: '' },
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
];

// alerts that are what the screenshot shows
const keepAlerts = ['account-not-registered', 'account-configuration-incomplete', 'account-recovery-codes'];

// one box around a whole form section, named as in [data-section]
const sectionBoxes = {
  'account-tenant-webauthn': 'bootstrap-passkey-authentication',
  'account-tenant-mfa-email': 'email-settings',
  'account-tenant-mfa-phone': 'phone-settings',
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
    await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { generateRefreshTokens: true } } });
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
    await api('PATCH', `/api/application/${appId}`, { application: { loginConfiguration: { generateRefreshTokens: false } } });

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

    const oauthAppId = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
    const oauthTenantId = '30663132-6464-6665-3032-326466613934';
    const oauthLoginUrl = `http://localhost:9011/oauth2/authorize?client_id=${oauthAppId}&redirect_uri=https%3A%2F%2Fexample.com&response_type=code&scope=openid`;

    const apiKey = 'screenshot-dev-key-not-for-production';

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
            // without hardDelete an application is only deactivated
            try { await api(path.startsWith('/api/application/') ? `${path}?hardDelete=true` : path, 'DELETE'); break; } catch (e) {
              // a form stays in use until its deleted application is gone
              if (i >= 60 || !e.message.includes('[inUse]')) throw e;
              await page.waitForTimeout(500);
            }
          }
          // applications and tenants are deleted in the background
          for (let i = 0; i < 60 && await exists(path); i++) await page.waitForTimeout(500);
        }
        if (wanted) await resources.create(api);
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
      if (wanted) state.undo = await state.apply();
      else {
        await state.undo();
        state.undo = undefined;
      }
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.reload({ waitUntil: 'networkidle' });
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

    // user manage pages for Big Head and Erlich: the Angular SPA may land on the Users
    // list before routing to the specific user -- wait for the Manage User heading.
    if (url.includes('00000000-0000-0000-0000-10000000000') && ctx?.name !== 'five-minute-registration-add') {
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
  },
};
