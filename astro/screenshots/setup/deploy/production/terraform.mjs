import { preparation, defaultTenantId } from '../../kit.mjs';
import { openDialog } from '../_shared.mjs';

async function showDefaultTenant(page) {
  await openDialog(page, `/ajax/tenant/view/${defaultTenantId}`);
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (/^[0-9a-f-]{36}$/.test(node.textContent.trim()) && !['30663132-6464-6665-3032-326466613934', '75a068fd-e94b-451a-9aeb-3ddb9a3b5987'].includes(node.textContent.trim())) node.textContent = '00000000-0000-0000-0000-f60000000020';
    }
  });
}

export const shots = {
  'operate-default-tenant-id': { fixedHeight: null, prepare: preparation({ beforeSizing: showDefaultTenant }) },
};
