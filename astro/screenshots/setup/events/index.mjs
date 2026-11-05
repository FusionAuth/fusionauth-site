import { preparation } from '../kit.mjs';
import { pinGeneratedValues } from './_shared.mjs';

export const shots = {
  'webhook-add': {
    fixedHeight: null,
    prepare: preparation({
      afterSystemTab: async page => {
        await page.fill('#webhook_url', 'https://example.com/fusionauth-events');
        await page.fill('#webhook_description', 'Example webhook');
      },
    }),
  },
  'webhook-security': { band: 'el-tab-list, #security' },
  'webhook-tenants': { switch: ['webhook_global'], band: 'el-tab-list, #tenants' },
  'webhook-tenants-selection': { band: 'el-tab-list, #tenants' },
  'webhook-headers': {
    band: 'el-tab-list, #headers',
    prepare: preparation({
      afterSystemTab: async page => {
        await page.locator('#header-add-button').click();
        const row = page.locator('#header-table tbody tr').last();
        await row.locator('input').nth(0).fill('Authorization');
        await row.locator('input').nth(1).fill('my-api-key');
      },
    }),
  },
  'webhook-test': {
    fixedHeight: null,
    prepare: preparation({ afterFraming: page => pinGeneratedValues(page, ['1792498058318', '1792498038823', '1792498041959']) }),
  },
};
