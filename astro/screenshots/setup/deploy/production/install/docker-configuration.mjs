import { preparation } from '../../../kit.mjs';
import { leftovers } from '../../../get-started/_shared.mjs';

async function fillMailcatcher(page) {
  await page.fill('#tenant_emailConfiguration_host', 'mailcatcher');
  await page.fill('#tenant_emailConfiguration_port', '1025');
  await page.fill('#tenant_emailConfiguration_defaultFromEmail', 'support@piedpiper.com');
}

export const shots = {
  'leftovers-tenant-mailcatcher': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers(fillMailcatcher) }) },
};
