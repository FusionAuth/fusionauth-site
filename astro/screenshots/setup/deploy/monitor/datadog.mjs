import { preparation, baseUrl, runtime } from '../../kit.mjs';
import { fill, grantMetricsEndpoint } from '../_shared.mjs';

// saves a real key, which beforeScreenshot deletes again before the next screenshot
async function createMetricsKey(page) {
  await page.goto(`${baseUrl}/admin/api-key/add`, { waitUntil: 'networkidle' });
  await fill(page, 'apiKeyId', '00000000-0000-0000-0000-f60000000002');
  await fill(page, 'apiKey_key', 'pied-piper-metrics-documentation-only');
  const description = page.locator("[id=\"apiKey_metaData_attributes['description']\"]");
  await description.fill('Prometheus metrics');
  await page.evaluate(() => {
    const box = [...document.querySelectorAll('input[type=checkbox]')].find(i => i.name === "apiKey.permissions.endpoints['/api/prometheus/metrics']" && i.value === 'GET');
    if (!box.checked) box.click();
  });
  await page.locator('button[type=submit]').click();
  await page.waitForURL(u => u.pathname === '/admin/api-key/');
  runtime.operateMetricsKeyExists = true;
  const listed = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('main tbody tr')];
    const row = rows.find(tr => tr.textContent.includes('Prometheus metrics'));
    if (!row) return rows.map(tr => tr.textContent.replace(/\s+/g, ' ').trim()).join('; ') || 'no rows';
    row.querySelector('td').dataset.hl = 'operate-key';
    row.querySelector('td a[href="#"]')?.click();
  });
  if (listed) throw new Error(`saved the Prometheus metrics API key, but the API key list doesn't show it. The list shows: ${listed}`);
  await page.waitForTimeout(500);
}

export const shots = {
  'operate-datadog-enableget-prometheus-endpoint': { fixedHeight: null, prepare: preparation({ beforeSizing: page => grantMetricsEndpoint(page, '/api/prometheus/metrics') }) },
  'operate-datadog-fusionauth-apikey': { fixedHeight: null, keepMetricsKey: true, prepare: preparation({ beforeSizing: createMetricsKey }) },
};
