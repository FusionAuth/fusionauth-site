import { preparation } from '../kit.mjs';
import { fillGatewayApiKey, leftovers, useDocsHost } from '../get-started/_shared.mjs';

// boxes the first five endpoint rows
async function boxLoginEndpoints(page) {
  await fillGatewayApiKey(page);
  await page.locator('fieldset:has(input[name="apiKey.permissions.endpoints[\'/api/login\']"])').evaluate(el => {
    const top = el.getBoundingClientRect();
    const rows = [...el.querySelectorAll('tbody tr')];
    const bottom = rows[4].getBoundingClientRect().bottom;
    const box = document.createElement('div');
    box.dataset.hl = 'leftovers-endpoints';
    box.style.cssText = `position:absolute;left:${top.left + scrollX}px;top:${top.top + scrollY}px;width:${top.width}px;height:${bottom - top.top}px;pointer-events:none`;
    document.body.append(box);
  });
  await useDocsHost(page);
}

export const shots = {
  'leftovers-api-key-create': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers(fillGatewayApiKey) }) },
  'leftovers-api-key-endpoint-permissions': { band: "[data-hl='leftovers-endpoints']", prepare: preparation({ beforeSizing: boxLoginEndpoints }) },
};
