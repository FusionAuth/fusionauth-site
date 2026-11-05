import { preparation } from '../../kit.mjs';
import { fill } from '../_shared.mjs';

const connectorId = '00000000-0000-0000-0000-f60000000004';

const piedPiperConnector = {
  order: 33,
  paths: [`/api/connector/${connectorId}`],
  create: async api => {
    await api(`/api/connector/${connectorId}`, 'POST', {
      connector: { type: 'Generic', name: 'Pied Piper API', authenticationURL: 'https://api.piedpiper.com/login', connectTimeout: 1000, readTimeout: 2000, debug: true },
    });
  },
};

// keeps the first 20 lines with fixed timestamps and durations
async function trimLogs(page) {
  await page.locator('pre').first().waitFor();
  await page.locator('pre').evaluateAll(logs => logs.forEach(log => {
    log.textContent = log.textContent.split('\n').slice(0, 20).join('\n')
      .replace(/\b\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} (AM|PM)\b/g, '2026-09-24 09:00:00.000 AM')
      .replace(/\b\d+ ms\b/g, '10 ms');
  }));
}

async function enableDebug(page) {
  await fill(page, 'connector_name', 'Pied Piper API');
  await fill(page, 'connector_authenticationURL', 'https://api.piedpiper.com/login');
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const el = document.getElementById('connector_debug');
    if (!el.checked) el.click();
    const r = el.closest('.form-row').getBoundingClientRect();
    const box = document.createElement('div'); box.dataset.hl = 'operate-debug';
    box.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;pointer-events:none`;
    document.body.append(box);
  });
}

export const shots = {
  'operate-system-logs-single-node': { fixedHeight: null, prepare: preparation({ beforeSizing: trimLogs }) },
  'operate-generic-connector-debug-enabled': { fixedHeight: null, prepare: preparation({ beforeSizing: enableDebug }), temporaryResources: [piedPiperConnector] },
};
