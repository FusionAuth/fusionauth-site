import { baseUrl } from '../kit.mjs';
import { leftoversAppId } from '../_shared.mjs';

const consentUrl = (clientId, scopes) =>
  `${baseUrl}/oauth2/authorize?client_id=${clientId}&redirect_uri=https%3A%2F%2Flocal.fusionauth.io%2Fcallback&response_type=code&scope=${scopes.map(encodeURIComponent).join('%20')}&prompt=login&locale=en`;

// signs in on the hosted login page until FusionAuth shows the consent page
const reachConsent = (name, url) => async page => {
  for (let i = 0; ; i++) {
    await page.context().clearCookies({ name: /^fusionauth\.oauth2/ });
    await page.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    const login = page.locator('#loginId');
    if (await login.isVisible()) {
      await login.fill('richard@piedpiper.com');
      await page.fill('#password', 'password');
      await Promise.all([
        page.waitForURL(u => u.pathname.includes('/oauth2/consent') || u.pathname === '/callback', { timeout: 15000 }),
        page.keyboard.press('Enter'),
      ]);
      await page.waitForLoadState('networkidle');
    }
    if (new URL(page.url()).pathname.includes('/oauth2/consent')) break;
    if (i === 60) throw new Error(`Leftovers hosted flow did not reach ${name}: ${new URL(page.url()).pathname}`);
    await page.waitForTimeout(500);
  }
};

// shows local.fusionauth.io for the local server, and the fixed id in the application Id field
async function useDocsHost(page) {
  await page.evaluate(appId => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replace(/http:\/\/localhost:\d+/g, 'https://local.fusionauth.io');
    for (const el of document.querySelectorAll('input:not([type=hidden]), textarea')) el.value = el.value.replace(/http:\/\/localhost:\d+/g, 'https://local.fusionauth.io');
    const id = document.querySelector('#_applicationId');
    if (id) id.value = appId;
  }, leftoversAppId);
}

async function keepFraming(page, ctx) {
  await page.evaluate(() => window.scrollTo(0, 0));
  // The generator centers the first highlight; these shots keep their window framing.
  if (ctx.highlights?.[0]?.selector) await page.locator(ctx.highlights[0].selector).first().evaluate(el => { el.scrollIntoView = () => {}; });
}

// a beforeSizing stage that runs edit, then the steps every leftovers shot shares
const leftovers = edit => async (page, ctx) => {
  await edit?.(page);
  await useDocsHost(page);
  await keepFraming(page, ctx);
};

async function fillGatewayApiKey(page) {
  await page.locator('[name="apiKey.metaData.attributes[\'description\']"]').fill('Pied Piper Gateway');
  await page.fill('#apiKey_key', 'pied-piper-gateway-example-api-key');
  await page.fill('#apiKey_name', 'Pied Piper Gateway');
}

export { consentUrl, reachConsent, useDocsHost, keepFraming, leftovers, fillGatewayApiKey };
