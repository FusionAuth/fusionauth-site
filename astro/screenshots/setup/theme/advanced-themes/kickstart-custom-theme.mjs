import { preparation } from '../../kit.mjs';

async function showForgotPasswordMessage(page) {
  await page.locator('main [role=tab]', { hasText: 'Messages' }).first().click();
  await page.waitForTimeout(800);
  await page.locator('#messages a[href*="isDefault=true"]').click();
  await page.locator('.prime-dialog.open .CodeMirror').waitFor();
  await page.waitForTimeout(1000);
  const tagged = await page.evaluate(() => {
    const cm = document.querySelector('.prime-dialog.open .CodeMirror')?.CodeMirror;
    if (!cm) return false;
    cm.setOption('viewportMargin', Infinity);
    const line = cm.getValue().split('\n').findIndex(l => l.startsWith('forgot-your-password='));
    if (line < 0) return false;
    cm.scrollIntoView({ line, ch: 0 }, 120);
    cm.refresh();
    const el = [...document.querySelectorAll('.prime-dialog.open .CodeMirror-line')].find(l => l.textContent.startsWith('forgot-your-password='));
    if (el) document.querySelector('.prime-dialog.open .CodeMirror').dataset.hl = 'forgot-message';
    return !!el;
  });
  if (!tagged) throw new Error('forgot-your-password message line not found');
}

export const shots = {
  'theme-preview-oauth-authorize': { fixedHeight: null, legacyVersion: true },
  'theme-preview-oauth-logout': { fixedHeight: null, legacyVersion: true },
  'theme-dark-messages': { fixedHeight: null, prepare: preparation({ afterThemeTab: showForgotPasswordMessage }) },
};
