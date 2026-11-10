import { preparation, baseUrl } from '../../kit.mjs';

// Mock WebAuthn so the page stays in "waiting" state rather than
// erroring (WebKit headless does not implement navigator.credentials.create).
async function reauthEnable(page, ctx, { oauthLoginUrl }) {
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
      await Promise.race([page.waitForURL(/reauth-enable/, { timeout: 8000 }), page.waitForURL(/example\.com/, { timeout: 8000 })]);
    } catch {
      await page.waitForTimeout(4000);
    }
  } catch (e) {
    throw new Error(`passkeys-reauth-enable: setup failed: ${e.message}`, { cause: e });
  }
}

// log in via OAuth then navigate to account webauthn management
async function selfService(page, ctx, { oauthAppId, oauthTenantId }) {
  try {
    await page.fill('#loginId', 'richard@piedpiper.com');
    await page.fill('#password', 'password');
    await page.locator('#submit-button').click();
    try { await page.waitForURL(/example\.com/, { timeout: 8000 }); } catch {}
    await page.goto(`${baseUrl}/account/webauthn/?client_id=${oauthAppId}&tenantId=${oauthTenantId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  } catch (e) {
    throw new Error(`passkeys-self-service: login/navigate failed: ${e.message}`, { cause: e });
  }
}

// tag the "Fingerprint, device or key" link for highlighting
async function bootstrapButton(page) {
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

// click "Fingerprint, device or key" from the OAuth login page
async function bootstrapLogin(page) {
  try {
    await page.locator('a').filter({ hasText: /Fingerprint, device or key/i }).first().click({ timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  } catch (e) {
    throw new Error(`passkeys-bootstrap-login: click failed: ${e.message}`, { cause: e });
  }
}

export const shots = {
  'passkeys-tenant-enable-webauthn': { legacyVersion: true },
  'passkeys-reauth-enable': { prepare: preparation({ afterAccount: reauthEnable }) },
  'passkeys-self-service': { prepare: preparation({ afterAccount: selfService }) },
  'passkeys-bootstrap-button': { prepare: preparation({ afterAccount: bootstrapButton }) },
  'passkeys-bootstrap-login': { prepare: preparation({ afterAccount: bootstrapLogin }) },
};
