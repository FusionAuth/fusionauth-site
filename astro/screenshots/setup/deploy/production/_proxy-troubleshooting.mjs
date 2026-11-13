import { preparation } from '../../kit.mjs';

// the dashboard posts to the proxy test in an iframe, so forge a proxy's headers on that one request
async function forgeProxy(page) {
  await page.route('**/admin/proxy-config-test', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    const response = await route.fetch({ headers: { ...route.request().headers(), 'x-forwarded-host': 'local.fusionauth.io', origin: 'https://local.fusionauth.io' } });
    // the routed iframe can answer before the dashboard listens for the result
    const body = (await response.text()).replace(/window\.parent\.postMessage\((\{[^}]*\}), '\*'\);/,
      "const send = () => window.parent.postMessage($1, '*'); window.parent.document.readyState === 'complete' ? send() : window.parent.addEventListener('load', send);");
    return route.fulfill({ response, body });
  }, { times: 2 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByText('Proxy Configuration Warning').waitFor();
}

export const shots = {
  'operate-proxy-warning': { fixedHeight: null, prepare: preparation({ prepare: forgeProxy }) },
};
