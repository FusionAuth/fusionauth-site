import { freshUrl, runtime } from './kit.mjs';
import { showSetupWizard } from './get-started/first-time-setup.mjs';

// the first-time setup shots create this admin on the fresh instance
const freshAdmin = { email: 'richard@piedpiper.com', password: 'password' };

async function openFreshDashboard(page, url) {
  if (!runtime.freshSetUp) {
    await page.goto(`${freshUrl}/admin/setup-wizard`, { waitUntil: 'networkidle' });
    if (new URL(page.url()).pathname.startsWith('/admin/setup-wizard')) {
      await showSetupWizard(page);
      await page.click('button[type=submit]');
      await page.waitForURL(u => u.pathname.startsWith('/admin') && !u.pathname.startsWith('/admin/setup-wizard'), { timeout: 30000 });
    }
    runtime.freshSetUp = true;
  }
  await page.goto(url, { waitUntil: 'networkidle' });
  if (await page.locator('#loginId').isVisible()) {
    await page.fill('#loginId', freshAdmin.email);
    await page.fill('#password', freshAdmin.password);
    await page.press('#password', 'Enter');
    await page.waitForURL(u => u.pathname.replace(/\/$/, '') === '/admin', { timeout: 30000 });
    await page.waitForLoadState('networkidle');
  }
}

const quickstartAppId = '5c8e2f4a-7b1d-4e9c-a3f6-0d2b8e7c1a94';

// matches the QuickStart instances: self-service registration on, no passwordless or passkey login
const quickstartApp = {
  order: 0,
  paths: [`/api/application/${quickstartAppId}`],
  create: async api => {
    await api(`/api/application/${quickstartAppId}`, 'POST', { application: {
      name: 'QuickStart App',
      oauthConfiguration: { authorizedRedirectURLs: ['http://localhost:3000/oauth-redirect'], enabledGrants: ['authorization_code', 'refresh_token'] },
      registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email' },
      webAuthnConfiguration: { enabled: true, bootstrapWorkflow: { enabled: false }, reauthenticationWorkflow: { enabled: false } },
    } });
  },
};

export const shots = {
  // a new instance like the reader's, with the QuickStart admin's email in place of the fresh admin
  'quickstart-admin-dashboard': {
    fresh: true,
    prepare: async (page, ctx, { url }) => {
      await openFreshDashboard(page, url);
      await page.evaluate(() => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          node.textContent = node.textContent.replace('Richard Hendricks', 'admin@example.com').replace('richard@piedpiper.com', 'admin@example.com');
        }
        // a Kickstarted instance skips First Time Setup, so the reader sees neither the setup card nor its menu item
        document.querySelectorAll('a[href^="/admin/first-time-setup"]').forEach(a => (a.closest('li') ?? a).style.display = 'none');
        const card = [...document.querySelectorAll('main h1, main h2, main h3')].find(h => h.textContent.trim() === 'New to FusionAuth?');
        let panel = card;
        while (panel && panel.parentElement && !panel.parentElement.matches('main')) {
          if (panel.parentElement.querySelectorAll('h1, h2, h3').length > 1) break;
          panel = panel.parentElement;
        }
        if (panel) panel.style.display = 'none';
        document.activeElement?.blur();
      });
    },
  },
  'quickstart-login': { temporaryResources: [quickstartApp] },
};
