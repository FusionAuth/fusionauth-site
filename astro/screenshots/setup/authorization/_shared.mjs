import { baseUrl } from '../kit.mjs';
import { leftoversAppId } from '../_shared.mjs';

export const authorizeUrl = (clientId, scope) =>
  `${baseUrl}/oauth2/authorize?client_id=${clientId}&redirect_uri=https%3A%2F%2Flocal.fusionauth.io%2Fcallback&response_type=code&scope=${scope}&prompt=login&locale=en`;

// Hosted captures enter through admin until their temporary app and scopes exist; with signIn, go on to the consent page.
export async function openHostedPage(page, name, url, { signIn = false } = {}) {
  for (let i = 0; ; i++) {
    await page.context().clearCookies({ name: /^fusionauth\.oauth2/ });
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    const login = page.locator('#loginId');
    if (await login.isVisible()) {
      if (!signIn) break;
      await login.fill('richard@piedpiper.com');
      await page.fill('#password', 'password');
      await Promise.all([
        page.waitForURL(u => u.pathname.includes('/oauth2/consent') || u.pathname === '/callback', { timeout: 15000 }),
        page.keyboard.press('Enter'),
      ]);
      await page.waitForLoadState('networkidle');
    }
    if (signIn && new URL(page.url()).pathname.includes('/oauth2/consent')) break;
    if (i === 60) throw new Error(`Leftovers hosted flow did not reach ${name}: ${new URL(page.url()).pathname}`);
    await page.waitForTimeout(500);
  }
}

// Show the local.fusionauth.io address and fixed ids, and keep the window framing.
export async function frameLeftovers(page, ctx, { scrollTop = true, pinKeyIds = false } = {}) {
  await page.evaluate(([appId, pinKeyIds]) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/http:\/\/localhost:\d+/g, 'https://local.fusionauth.io');
    for (const el of document.querySelectorAll('input:not([type=hidden]), textarea')) el.value = el.value.replace(/http:\/\/localhost:\d+/g, 'https://local.fusionauth.io');
    const id = document.querySelector('#_applicationId');
    if (id) id.value = appId;
    if (pinKeyIds) {
      let n = 0;
      for (const cell of document.querySelectorAll('main td')) {
        if (/^[a-f0-9-]{36}$/.test(cell.textContent.trim()) && !cell.textContent.includes('f700')) cell.textContent = `00000000-0000-0000-0000-f700000003${String(n++).padStart(2, '0')}`;
      }
    }
  }, [leftoversAppId, pinKeyIds]);
  if (scrollTop) await page.evaluate(() => window.scrollTo(0, 0));
  // The generator centers the first highlight; these shots keep their window framing.
  if (ctx.highlights?.[0]?.selector) await page.locator(ctx.highlights[0].selector).first().evaluate(el => { el.scrollIntoView = () => {}; });
}

// a stage that runs the shot's own steps, then frames it
export const leftovers = (steps, framing) => async (page, ctx, info) => {
  await steps?.(page, ctx, info);
  await frameLeftovers(page, ctx, framing);
};
