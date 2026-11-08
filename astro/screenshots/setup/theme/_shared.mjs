import { baseUrl, piedPiperThemeId, simpleThemeId, darkThemeId, defaultThemeId, projectRoot, apiKey } from '../kit.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

async function configureThemes(context) {

  // ensure Screenshots Theme exists (used by theme-localization-messages screenshot)
  try {
    const themeId = '00000000-0000-0000-0000-300000000001';
    const tResp = await fetch(`${baseUrl}/api/theme/${themeId}`, { headers: { Authorization: apiKey } });
    if (!tResp.ok) {
      await fetch(`${baseUrl}/api/theme/${themeId}`, {
        method: 'POST',
        headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceThemeId: defaultThemeId, theme: { id: themeId, name: 'Screenshots Theme' } }),
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
      method, headers: { Authorization: apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).then(async r => { if (!r.ok) throw new Error(`${method} theme ${id}: ${r.status} ${await r.text()}`); });
    const exists = async id => (await fetch(`${baseUrl}/api/theme/${id}`, { headers: { Authorization: apiKey } })).ok;

    if (!(await exists(piedPiperThemeId))) await theme(piedPiperThemeId, 'POST', { sourceThemeId: simpleThemeId, theme: { name: 'Pied Piper' } });
    await theme(piedPiperThemeId, 'PATCH', { theme: { variables: {
      primaryButtonColor: '#1f8a4c', primaryButtonFocusColor: '#17703c', linkTextColor: '#1f8a4c', linkTextFocusColor: '#17703c',
      pageBackgroundColor: '#e7f2eb', iconBackgroundColor: '#1f8a4c',
    } } });

    if (!(await exists(darkThemeId))) await theme(darkThemeId, 'POST', { sourceThemeId: defaultThemeId, theme: { name: 'Dark Theme' } });
    const { theme: source } = await (await fetch(`${baseUrl}/api/theme/${defaultThemeId}`, { headers: { Authorization: apiKey } })).json();
    const stylesheet = readFileSync(join(projectRoot, 'screenshots/themes/dark-theme.css'), 'utf-8');
    await theme(darkThemeId, 'PATCH', { theme: { stylesheet, defaultMessages: source.defaultMessages } });
  } catch (e) {
    throw new Error(`beforeAll: theme setup failed: ${e.message}`, { cause: e });
  }
}

// chooses (doesn't save) the shot's themeSelect in the Theme select
async function selectTheme(page, ctx, info) {
  const tagged = await page.evaluate(id => {
    const select = [...document.querySelectorAll('select')].find(s => /themeId$/.test(s.id));
    if (!select) return false;
    select.value = id;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    (select.closest('[id$="-form-row"]') ?? select.parentElement).dataset.hl = 'theme-select';
    return select.value === id;
  }, info.shot.themeSelect);
  if (!tagged) throw new Error('theme select not set');
  // the highlight is centred in the window, so a window twice its height keeps the page at the top
  const center = await page.evaluate(() => { const r = document.querySelector("[data-hl='theme-select']").getBoundingClientRect(); return r.top + r.height / 2 + window.scrollY; });
  await page.setViewportSize({ width: page.viewportSize().width, height: Math.round(center * 2) });
}

export const resources = [configureThemes];

export { selectTheme };
