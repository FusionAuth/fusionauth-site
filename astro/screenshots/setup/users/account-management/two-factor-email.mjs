import { preparation } from '../../kit.mjs';
import { twoFactorMessaging } from './_shared.mjs';

async function chooseEmail(page) {
  await page.locator('#select-method').selectOption('email');
  await page.waitForTimeout(500);
  await page.locator('input[name=email]:visible').fill('example@email.com');
}

export const shots = {
  'account-tenant-mfa-email': { fixedHeight: null, sectionBox: 'email-settings', legacyVersion: true, temporaryState: [twoFactorMessaging] },
  'account-two-factor-email': { prepare: preparation({ beforeUserTabs: chooseEmail }), temporaryState: [twoFactorMessaging] },
};
