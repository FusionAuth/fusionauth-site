import { preparation, apiRequest, baseUrl, darkThemeId } from '../../kit.mjs';

// the app from the guide's Kickstart, with the dark theme applied; example.com since an SSO login redirects before sign out
const kickstartAppId = '404e516b-06b8-49da-9c68-c1cd1928c81d';
const kickstartApp = {
  order: 43,
  paths: [`/api/application/${kickstartAppId}`],
  create: async api => {
    await api(`/api/application/${kickstartAppId}`, 'POST', { application: {
      name: 'Kickstart App',
      themeId: darkThemeId,
      oauthConfiguration: { authorizedRedirectURLs: ['http://localhost:3000/oauth-redirect', 'https://example.com'], enabledGrants: ['authorization_code', 'refresh_token'] },
    } });
    // a new app renders the tenant theme for a few seconds
    for (let i = 0; !(await (await fetch(`${baseUrl}/oauth2/authorize?client_id=${kickstartAppId}&redirect_uri=https%3A%2F%2Fexample.com&response_type=code`)).text()).includes('background-color: black'); i++) {
      if (i >= 60) throw new Error('dark theme never applied to the Kickstart App');
      await new Promise(r => setTimeout(r, 1000));
    }
  },
};

// the guide's message change, undone after the shot
const clickHereState = {
  order: 93,
  apply: async () => {
    const { theme } = await apiRequest(`/api/theme/${darkThemeId}`);
    const defaultMessages = theme.defaultMessages.replace(/^forgot-your-password=.*$/m, 'forgot-your-password=Forgot your password? Click here.');
    await apiRequest(`/api/theme/${darkThemeId}`, 'PATCH', { theme: { defaultMessages } });
    return () => apiRequest(`/api/theme/${darkThemeId}`, 'PATCH', { theme: { defaultMessages: theme.defaultMessages } });
  },
};

const darkLogin = extra => ({ temporaryResources: [kickstartApp], signedOut: true, ...extra });
const tagForgot = (page, ctx, { tag }) => tag('forgot-password', () => document.querySelector('a[href*="/password/forgot"]'));

async function showForgotPasswordMessage(page) {
  await page.locator('main [role=tab]', { hasText: 'Messages' }).first().click();
  await page.waitForTimeout(800);
  await page.locator('#messages a[href*="isDefault=true"]').click();
  await page.locator('.prime-dialog.open .CodeMirror').waitFor();
  await page.waitForTimeout(1000);
  const tagged = await page.evaluate(() => {
    const cm = document.querySelector('.prime-dialog.open .CodeMirror')?.CodeMirror;
    if (!cm) return false;
    cm.setOption('viewportMargin', Infinity);
    const line = cm.getValue().split('\n').findIndex(l => l.startsWith('forgot-your-password='));
    if (line < 0) return false;
    cm.scrollIntoView({ line, ch: 0 }, 120);
    cm.refresh();
    const el = [...document.querySelectorAll('.prime-dialog.open .CodeMirror-line')].find(l => l.textContent.startsWith('forgot-your-password='));
    if (el) document.querySelector('.prime-dialog.open .CodeMirror').dataset.hl = 'forgot-message';
    return !!el;
  });
  if (!tagged) throw new Error('forgot-your-password message line not found');
}

export const shots = {
  'theme-preview-oauth-authorize': { fixedHeight: null, legacyVersion: true },
  'theme-preview-oauth-logout': { fixedHeight: null, legacyVersion: true },
  'theme-preview-dark-authorize': { fixedHeight: null, legacyVersion: true },
  'theme-preview-dark-logout': { fixedHeight: null, legacyVersion: true },
  'theme-dark-login': darkLogin(),
  'theme-dark-forgot-password': darkLogin({ prepare: preparation({ afterSignOut: tagForgot }) }),
  'theme-dark-updated-message': darkLogin({ temporaryState: [clickHereState], prepare: preparation({ afterSignOut: tagForgot }) }),
  'theme-dark-messages': { fixedHeight: null, prepare: preparation({ afterThemeTab: showForgotPasswordMessage }) },
};
