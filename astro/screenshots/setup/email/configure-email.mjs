import { preparation } from '../kit.mjs';

// tag and scroll to the test email control
async function showSendTestEmail(page) {
  const tagged = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('a, button')].find(el => /send test email/i.test(el.textContent.trim()));
    if (!btn) return false;
    const row = btn.closest('fieldset, .form-row, div') ?? btn;
    row.setAttribute('data-hl', 'send-test-email');
    row.scrollIntoView({ block: 'center', behavior: 'instant' });
    return true;
  });
  if (!tagged) throw new Error('send test email control not found');
  await page.waitForTimeout(300);
}

export const shots = {
  'tenant-send-test-email': { legacyVersion: true, prepare: preparation({ tenantTab: showSendTestEmail }) },
};
