import { authShot } from '../../_shared.mjs';

export const shots = {
  'authenticate-aiven-api-key-add': authShot({ fixedHeight: "[data-scroll='api-key-endpoints']" }, async page => {
    await page.fill('#apiKey_name', 'Certificate generator');
    await page.fill('#apiKey_key', 'certificate-generator-key-not-for-production-NKU5Ypg');
    await page.fill("[id=\"apiKey_metaData_attributes['description']\"]", 'Certificate generator');
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll('#endpoints tr')];
      const i = rows.findIndex(tr => tr.firstElementChild?.textContent.trim() === '/api/key/import');
      rows[i].querySelector('input[value=POST]').click();
      rows[i - 2].dataset.scroll = 'api-key-endpoints';
    });
    await page.evaluate(() => document.activeElement?.blur());
  }),
};
