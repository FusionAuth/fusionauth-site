import { preparation } from '../../kit.mjs';
import { leftovers } from '../../get-started/_shared.mjs';
import { showSetupWizard } from '../../get-started/first-time-setup.mjs';

async function optOutInWizard(page) {
  await showSetupWizard(page);
  await page.uncheck('#usageDataEnabled');
  await page.evaluate(() => { document.getElementById('usageDataEnabled').closest('label, .form-row, div').dataset.hl = 'usage-data'; });
}

export const shots = {
  'collected-metrics-setup-wizard': { fresh: true, prepare: optOutInWizard },
  'leftovers-usage-data-collection': { switch: ['systemConfiguration_usageDataConfiguration_enabled'], fixedHeight: null, prepare: preparation({ beforeSizing: leftovers() }) },
};
