import { preparation, defaultTenantId } from '../../kit.mjs';
import { fillGatewayApiKey, leftovers } from '../../get-started/_shared.mjs';

async function fillTenantApiKey(page) {
  await fillGatewayApiKey(page);
  await page.selectOption('#tenantId', defaultTenantId);
}

export const shots = {
  'leftovers-api-key-tenant': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers(fillTenantApiKey) }) },
};
