import { preparation } from '../../kit.mjs';

async function nameTheme(page) {
  await page.locator('input[name="theme.name"]').fill('Tailwind + DaisyUI');
  await page.evaluate(() => document.activeElement?.blur());
}

async function showPreviewMenu(page) {
  const opened = await page.evaluate(name => {
    const row = [...document.querySelectorAll('tbody tr')].find(tr => tr.querySelector('td')?.textContent.trim() === name);
    // the actions menu is a popover, which a scripted click doesn't open
    const menu = document.getElementById(row?.querySelector('button[popovertarget]')?.getAttribute('popovertarget'));
    menu?.showPopover();
    return !!menu;
  }, 'Pied Piper');
  if (!opened) throw new Error('Pied Piper theme row not found');
  await page.waitForTimeout(500);
  const tagged = await page.evaluate(() => {
    // the menu is a fixed-position popover, so test its size rather than offsetParent
    const item = [...document.querySelectorAll('a[href^="/admin/theme/view/"]')].find(a => a.getBoundingClientRect().width > 0 && a.textContent.trim() === 'Preview');
    if (item) item.dataset.hl = 'theme-preview';
    return !!item;
  });
  if (!tagged) throw new Error('Preview menu item not shown');
  await page.evaluate(() => {
    const item = document.querySelector("[data-hl='theme-preview']");
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

export const shots = {
  'theme-add-advanced': { fixedHeight: null, prepare: preparation({ afterControls: nameTheme }) },
  'theme-preview-menu': { legacyVersion: true, prepare: preparation({ afterControls: showPreviewMenu }) },
};
