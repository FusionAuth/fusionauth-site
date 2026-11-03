import { preparation } from '../../../kit.mjs';
import { exampleAppId, exampleApp } from './_shared.mjs';

// Pin generated values in the older overview capture.
async function pinRecentLogins(page) {
  await page.evaluate(() => {
    const users = ['richard@piedpiper.com', 'jianyang@octhulu.com', 'gavin@hooli.com', 'monica@raviga.com', 'gilfoyle@piedpiper.com', 'dinesh@piedpiper.com', 'erlich@bachmanity.com', 'bighead@piedpiper.com', 'richard@piedpiper.com', 'richard@piedpiper.com'];
    document.querySelectorAll('main tbody tr').forEach((row, i) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 4 || !users[i]) return;
      cells[0].textContent = users[i];
      cells[1].textContent = i === 0 || i === 9 ? 'FusionAuth' : 'Pied Piper';
      cells[3].textContent = i === 0 ? '192.168.65.1' : '127.0.0.1';
    });
  });
}

// FusionAuth creates the Tenant manager application with a new random id on each start
async function pinTenantManagerId(page) {
  const pinned = await page.evaluate(() => {
    const row = [...document.querySelectorAll('tr')].find(tr => tr.querySelector('td')?.textContent.trim() === 'Tenant manager');
    const cell = row?.querySelectorAll('td')[1];
    if (cell) cell.textContent = '00000000-0000-0000-0000-700000000001';
    return !!cell;
  });
  if (!pinned) throw new Error('Tenant manager row not found');
}

async function showClientCredentials(page, ctx, { url, tag }) {
  await page.evaluate(id => {
    const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, exampleAppId);
  await page.locator('.prime-dialog.open, dialog[open]').first().waitFor();
  await page.waitForTimeout(800);
  await page.evaluate(origin => {
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open, dialog[open]'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(origin, 'https://local.fusionauth.io');
  }, new URL(url).origin);
  await tag('client-credentials', () => {
    const rows = [...document.querySelectorAll('.prime-dialog.open tr, dialog[open] tr, .prime-dialog.open dt, dialog[open] dt')];
    const id = rows.find(r => /^Client Id/i.test(r.textContent.trim()));
    const secret = rows.find(r => /^Client secret/i.test(r.textContent.trim()));
    if (!id || !secret) return null;
    let scroller = id.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    if (scroller) scroller.scrollTop += id.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 120;
    // one box around both rows
    const box = document.createElement('div');
    const a = id.getBoundingClientRect(), b = secret.getBoundingClientRect();
    box.style.cssText = `position:fixed;left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${b.bottom - a.top}px;pointer-events:none`;
    document.body.append(box);
    return box;
  });
}

export const shots = {
  'five-minute-dashboard': {
    fixedHeight: null,
    legacyVersion: true,
    prepare: preparation({
      beforeUserTabs: (page, ctx, { tag }) => tag('applications-nav', () => [...document.querySelectorAll('nav a[href="/admin/application/"]')].find(a => a.offsetParent)),
      afterFraming: pinRecentLogins,
    }),
  },
  'five-minute-application-listing': { legacyVersion: true, prepare: preparation({ afterControls: pinTenantManagerId }) },
  'five-minute-application-form': { legacyVersion: true, temporaryResources: [exampleApp] },
  'five-minute-application-details': { fixedHeight: null, legacyVersion: true, prepare: preparation({ beforeUserTabs: showClientCredentials }), temporaryResources: [exampleApp] },
};
