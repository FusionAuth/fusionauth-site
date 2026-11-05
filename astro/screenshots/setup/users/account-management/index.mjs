import { pinTotp, preparation, removeTwoFactor, piedPiperAppId, baseUrl, totpCode } from '../../kit.mjs';

// enabled in the screenshot itself
const noTwoFactor = {
  order: 5,
  apply: async () => removeTwoFactor,
};

async function applicationDetails(page) {
  await page.evaluate(id => {
    const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
    link?.closest('[popover]')?.showPopover();
    link?.click();
  }, piedPiperAppId);
  await page.locator('.prime-dialog.open').waitFor();
  await page.waitForTimeout(800);
  // match the address bar the frame shows, and start the dialog at the Created row like the original
  await page.evaluate(baseUrl => {
    const created = [...document.querySelectorAll('.prime-dialog.open tr')].find(r => /^Created/.test(r.textContent.trim()));
    let scroller = created?.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) scroller = scroller.parentElement;
    if (scroller) scroller.scrollTop += created.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    const walker = document.createTreeWalker(document.querySelector('.prime-dialog.open'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) node.textContent = node.textContent.replaceAll(baseUrl, 'https://local.fusionauth.io');
  }, baseUrl);
}

async function editPassword(page) {
  await page.getByText('Change password').click();
  await page.locator('input[type=password]').first().waitFor();
}

async function recoveryCodes(page) {
  // the secret in the page is swapped for the fixed one
  await pinTotp(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.fill('input[name=code]', totpCode());
  await page.getByRole('button', { name: 'Enable', exact: true }).click();
  await page.waitForLoadState('networkidle');
  // the codes are new on each run
  const pinned = await page.evaluate(() => {
    const fixed = ['8SHN5-KXPC9', 'LG4TV-8BRZ3', 'HN5B3-XDTFX', 'NYY6P-DHHL7', 'W6QX9-LDV6L', 'TK265-Z8YNH', 'BX2KZ-N7LHQ', 'LS833-8ST38', 'W8Y5H-SS8KW', '9FDST-S3TFF'];
    let i = 0;
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      node.textContent = node.textContent.replace(/\b[A-Z0-9]{5}-[A-Z0-9]{5}\b/g, () => fixed[i++ % fixed.length]);
    }
    return i;
  });
  if (!pinned) throw new Error('recovery codes not shown');
  await page.unrouteAll();
}

export const shots = {
  'account-application-details': { fixedHeight: null, prepare: preparation({ beforeUserTabs: applicationDetails }) },
  'account-edit-password': { prepare: preparation({ beforeUserTabs: editPassword }) },
  'account-two-factor': {},
  'account-recovery-codes': { keepAlerts: true, prepare: preparation({ beforeUserTabs: recoveryCodes }), temporaryState: [noTwoFactor] },
};
