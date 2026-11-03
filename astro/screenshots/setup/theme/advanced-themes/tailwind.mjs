import { preparation } from '../../kit.mjs';

async function grantThemeApi(page) {
  const tagged = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll('input[type=checkbox]')].filter(i => i.name === "apiKey.permissions.endpoints['/api/theme']");
    for (const box of boxes) if (['GET', 'PATCH'].includes(box.value) && !box.checked) box.click();
    const row = boxes[0]?.closest('tr');
    if (row) row.dataset.hl = 'api-theme-row';
    return !!row;
  });
  if (!tagged) throw new Error('/api/theme permission row not found');
}

export const shots = {
  'theme-create-api-key': { fixedHeight: "[data-hl='api-theme-row']", prepare: preparation({ afterThemeTab: grantThemeApi }) },
};
