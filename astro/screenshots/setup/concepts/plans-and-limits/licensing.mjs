import { preparation, apiRequest } from '../../kit.mjs';

// read at call time, since the runner loads astro/.env after importing setup modules
const licenseKey = () => process.env.FUSIONAUTH_LICENSE_KEY;

async function waitForLicensed(licensed) {
  for (let i = 0; i < 30; i++) {
    if (!!(await apiRequest('/api/reactor')).status?.licensed === licensed) return;
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error(`reactor did not become ${licensed ? 'licensed' : 'unlicensed'}`);
}

// the activate form only shows while unlicensed, so deactivate for that shot and reactivate after
const reactorDeactivated = {
  order: 90,
  apply: async () => {
    if (!licenseKey()) return async () => {};
    await apiRequest('/api/reactor', 'DELETE');
    await waitForLicensed(false);
    return async () => {
      await apiRequest('/api/reactor', 'POST', { licenseId: licenseKey() });
      await waitForLicensed(true);
    };
  },
};

// hide the instance Id and any trace of the real license key
async function maskReactor(page) {
  const leaked = await page.evaluate(key => {
    const label = [...document.querySelectorAll('span, dt, label, strong')].find(e => /^Instance ID/i.test(e.textContent.trim()));
    if (!label) throw new Error('Instance ID label not found');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const id = label.parentElement.textContent.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)?.[0];
    const swap = text => {
      if (id) text = text.replaceAll(id, '00000000-0000-0000-0000-000000000001');
      return key ? text.replaceAll(key, 'XXXXXXXX') : text;
    };
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = swap(node.textContent);
    for (const el of document.querySelectorAll('*')) for (const a of el.attributes) if (swap(a.value) !== a.value) a.value = swap(a.value);
    for (const input of document.querySelectorAll('input:not([type=hidden]), textarea')) input.value = '';
    const html = document.documentElement.outerHTML;
    return (!!key && html.includes(key)) || (!!id && html.includes(id));
  }, licenseKey());
  if (leaked) throw new Error('license key or instance Id still on the Reactor page');
}

async function openActions(page, ctx, { freezeMenu }) {
  await page.getByRole('button', { name: /Actions/ }).click();
  await page.locator('#deactivate-license').waitFor({ state: 'visible' });
  await page.locator('#deactivate-license').evaluate(el => el.setAttribute('data-hl', 'deactivate-license'));
  // the menu closes before capture, so pin a copy in place
  await freezeMenu('[popover]:has(#deactivate-license)');
}

export const shots = {
  'licensing-reactor-activate': { temporaryState: [reactorDeactivated], fixedHeight: null, prepare: preparation({ afterFraming: maskReactor }) },
  'licensing-reactor-activated': { fixedHeight: null, prepare: preparation({ afterFraming: maskReactor }) },
  'licensing-reactor-deactivate': { fixedHeight: null, prepare: preparation({ beforeSizing: openActions, afterFraming: maskReactor }) },
};
