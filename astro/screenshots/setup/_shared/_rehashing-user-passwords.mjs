import { preparation } from '../kit.mjs';

async function tagRehashSwitch(page, ctx, { tag }) {
  await tag('migration-rehash', () => document.getElementById('tenant_passwordEncryptionConfiguration_modifyEncryptionSchemeOnLogin-form-row'));
  await page.evaluate(() => window.scrollTo(0, 0));
}

export const shots = {
  'migration-rehash-on-login': {
    switch: ['tenant_passwordEncryptionConfiguration_modifyEncryptionSchemeOnLogin'],
    band: "[data-section='cryptographic-hash-settings']",
    prepare: preparation({ beforeSizing: tagRehashSwitch }),
  },
};
