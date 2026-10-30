import { preparation } from '../../../kit.mjs';
import { twoFactorMessaging } from './_shared.mjs';

async function chooseSms(page) {
  await page.locator('#select-method').selectOption('sms');
  await page.waitForTimeout(500);
}

export const shots = {
  'account-tenant-mfa-phone': { fixedHeight: null, sectionBox: 'phone-settings', legacyVersion: true, temporaryState: [twoFactorMessaging] },
  'account-two-factor-phone': { prepare: preparation({ beforeUserTabs: chooseSms }), temporaryState: [twoFactorMessaging] },
};
