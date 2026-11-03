import { baseUrl, apiKey } from '../../kit.mjs';

const exampleWebhookId = '00000000-0000-0000-0000-600000000001';

// the example webhook for the tenant Webhooks tab and the webhook pages
async function createExampleWebhook() {
  try {
    const webhookUrl = `${baseUrl}/api/webhook/${exampleWebhookId}`;
    if (!(await fetch(webhookUrl, { headers: { Authorization: apiKey } })).ok) {
      const r = await fetch(webhookUrl, {
        method: 'POST', headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook: { url: 'https://example.com/fusionauth-events', description: 'Example webhook', connectTimeout: 1000, readTimeout: 2000 } }),
      });
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
    }
  } catch (e) {
    throw new Error(`beforeAll: webhook setup failed: ${e.message}`, { cause: e });
  }
}

export const resources = [createExampleWebhook];

// Pin the instants, ids and durations FusionAuth generates on each run; `events` also pins event and attempt ids and timings.
export const pinGeneratedValues = (page, targets, { events = false, sourceIds = false } = {}) =>
  page.evaluate(([targets, events, sourceIds]) => {
    const instants = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      node.textContent = node.textContent.replace(/\b\d{13}\b/g, value => {
        if (!instants.has(value)) instants.set(value, targets[instants.size] ?? targets.at(-1));
        return instants.get(value);
      });
      if (sourceIds) node.textContent = node.textContent.replace(/("id"\s*:\s*)\d+/g, (_, prefix) => prefix + '2');
      if (events) {
        node.textContent = node.textContent.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g, id => id === '00000000-0000-0000-0000-600000000001' ? id : '11cd546c-55fa-464c-b498-2f52021b4828').replace(/\b\d+ ms\b/g, '35 ms');
        if (node.parentElement?.closest('.cm-line, .CodeMirror-line')?.textContent.match(/"id"\s*:/) && /^\d+$/.test(node.textContent)) node.textContent = '2';
      }
    }
  }, [targets, events, sourceIds]);

export { exampleWebhookId };
