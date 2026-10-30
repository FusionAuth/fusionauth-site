import { registerIds, registerShot, openSignedOut, showRegistrationUrl } from './_shared.mjs';

// long URLs wrap instead of widening the dialog
async function wrapDialogTables(page) {
  await page.evaluate(() => {
    for (const table of document.querySelectorAll('.prime-dialog.open table')) {
      table.style.tableLayout = 'fixed';
      table.style.width = '100%';
      for (const cell of table.querySelectorAll('td, th')) cell.style.overflowWrap = 'anywhere';
      for (const row of table.rows) if (row.cells.length === 2) { row.cells[0].style.width = '28%'; row.cells[1].style.width = '72%'; }
    }
  });
}

async function searchCarla(page) {
  await page.fill('#s_queryString', 'carla');
  await page.locator('#user-search-form button').filter({ hasText: /Search/ }).first().click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

export const shots = {
  'register-register-new-user': registerShot({ before: openSignedOut }),
  'register-basic-registration-settings': registerShot({ fixedHeight: '.tab-list-container' }),
  'register-registration-url': registerShot({ before: showRegistrationUrl(registerIds.basic), afterFraming: wrapDialogTables }),
  'register-new-user-listing': registerShot({ before: searchCarla }),
};
