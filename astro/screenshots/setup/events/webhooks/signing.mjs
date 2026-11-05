import { preparation } from '../../kit.mjs';

async function openGenerateKeyMenu(page) {
  await page.locator('main tbody tr').first().waitFor();
  // FusionAuth generates the signing key ids and lists the keys in no fixed order
  await page.evaluate(() => {
    for (const row of document.querySelectorAll('main tbody tr')) {
      const cells = row.querySelectorAll('td');
      if (cells[1]?.textContent.trim() === 'Default signing key') cells[0].textContent = '00cc3b11-eb11-4b4d-bbc5-45c5c0787c98';
      if (cells[1]?.textContent.trim() === 'Tenant manager signing key') cells[0].textContent = '1f8e8340-4ffc-40ac-ae26-3085d39f4035';
    }
    const body = document.querySelector('main tbody');
    [...body.rows].sort((a, b) => a.cells[1].textContent.localeCompare(b.cells[1].textContent)).forEach(row => body.append(row));
  });
  const opened = await page.evaluate(() => {
    const item = document.querySelector('[popover] a[href="/ajax/key/generate/RSA"]');
    item?.closest('[popover]').showPopover();
    if (item) item.dataset.hl = 'generate-rsa';
    return !!item;
  });
  if (!opened) throw new Error('Generate RSA key pair menu item not found');
  await page.waitForTimeout(500);
  // the menu can close before the capture, so leave a plain copy of it in its place
  await page.evaluate(() => {
    const item = document.querySelector("[data-hl='generate-rsa']");
    const menu = item.closest('[popover]');
    Object.assign(menu.style, { transition: 'none', animation: 'none', transform: 'none', scale: '1', opacity: '1' });
    const r = menu.getBoundingClientRect();
    const copy = document.createElement('div');
    copy.className = menu.className;
    copy.innerHTML = menu.innerHTML;
    copy.style.cssText = `position:absolute;margin:0;left:${r.left + scrollX}px;top:${r.top + scrollY}px;width:${r.width}px;z-index:1000;transition:none;animation:none;transform:none;scale:1;opacity:1`;
    delete item.dataset.hl;
    document.body.append(copy);
    menu.hidePopover();
  });
}

async function chooseSigningKey(page) {
  const chosen = await page.evaluate(() => {
    const select = document.getElementById('webhook_signatureConfiguration_signingKeyId');
    const option = [...(select?.options ?? [])].find(o => o.value);
    if (option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
    return !!option;
  });
  if (!chosen) throw new Error('no signing key to choose');
}

export const shots = {
  'webhook-key-gen': { prepare: preparation({ afterSystemTab: openGenerateKeyMenu }) },
  'webhook-signature': {
    switch: ['webhook_signatureConfiguration_enabled'],
    legacyVersion: true,
    prepare: preparation({ afterSystemTab: chooseSigningKey }),
  },
};
