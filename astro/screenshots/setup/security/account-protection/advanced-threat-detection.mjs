import { preparation, baseUrl } from '../../kit.mjs';
import { fill } from '../../deploy/_shared.mjs';

const aclId = '00000000-0000-0000-0000-f60000000001';

const internalNetworkAcl = {
  order: 32,
  paths: [`/api/ip-acl/${aclId}`],
  create: async api => {
    await api(`/api/ip-acl/${aclId}`, 'POST', {
      ipAccessControlList: {
        name: 'Internal network',
        entries: [{ startIPAddress: '*', action: 'Block' }, { startIPAddress: '10.1.0.0', endIPAddress: '10.2.0.0', action: 'Allow' }],
      },
    });
  },
};

// a failed login looks the same whether the password is wrong or rate limiting blocked it
async function failLogin(page) {
  await page.fill('#loginId', 'richard@piedpiper.com');
  await page.fill('#password', 'not-the-password');
  await page.locator('#submit-button').click();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.activeElement?.blur());
}

async function fillCaptcha(page) {
  await fill(page, 'tenant_captchaConfiguration_siteKey', 'pied-piper-recaptcha-site-key');
  await fill(page, 'tenant_captchaConfiguration_secretKey', 'pied-piper-recaptcha-secret-key');
  await fill(page, 'tenant_captchaConfiguration_threshold', '0.5');
  await page.evaluate(() => { document.getElementById('threat-detection-captcha').dataset.hl = 'operate-captcha'; });
}

async function editAcl(page) {
  await page.goto(`${baseUrl}/admin/ip-acl/edit/${aclId}`, { waitUntil: 'networkidle' });
  await fill(page, 'ipAccessControlListId', aclId);
}

async function fillApiKeyAcl(page) {
  await fill(page, 'apiKey_key', 'pied-piper-internal-documentation-only');
  await fill(page, 'apiKey_ipAccessControlListId', aclId);
  await page.evaluate(() => { document.getElementById('apiKey_ipAccessControlListId').closest('.form-row').dataset.hl = 'operate-acl'; });
}

export const shots = {
  'operate-rate-limit-settings': { band: "[data-section='rate-limit-settings']" },
  'operate-enter-captcha-details': { switch: ['tenant_captchaConfiguration_enabled'], fixedHeight: 'CAPTCHA', prepare: preparation({ beforeSizing: fillCaptcha }) },
  'operate-ip-acl-list': { fixedHeight: null, prepare: preparation({ beforeSizing: editAcl }), temporaryResources: [internalNetworkAcl] },
  'operate-ip-acl-application': {
    fixedHeight: null,
    sectionBox: 'access-control-lists-settings',
    prepare: preparation({ beforeSizing: page => fill(page, 'application_accessControlConfiguration_uiIPAccessControlListId', aclId) }),
    temporaryResources: [internalNetworkAcl],
  },
  'operate-ip-acl-api-key': { fixedHeight: null, prepare: preparation({ beforeSizing: fillApiKeyAcl }), temporaryResources: [internalNetworkAcl] },
  'operate-block-domains': {
    fixedHeight: 'Blocked domains settings',
    sectionBox: 'blocked-domains-settings',
    prepare: preparation({ beforeSizing: page => fill(page, 'blockedDomains', 'gmail.com\nyahoo.com\nhotmail.com') }),
  },
  'operate-security-emails-list': { fixedHeight: 'Template settings' },
  'operate-rate-limit-login-failed': { signedOut: true, keepAlerts: true, prepare: preparation({ afterSignOut: failLogin }) },
};
