import { preparation } from '../../kit.mjs';
import { leftovers } from '../_shared.mjs';
import { gatewayApp } from './_shared.mjs';

async function fillUser(page) {
  await page.fill('#user_email', 'developer@piedpiper.com');
  await page.locator('#sendSetPasswordIdentityType-doNotSend').check({ force: true });
  await page.fill('#user_password', 'pied-piper-password');
  await page.fill('#confirm_user_password', 'pied-piper-password');
  await page.waitForFunction(() => document.querySelector('#password-fields')?.style.height === 'auto');
  await page.evaluate(() => document.activeElement?.blur());
}

export const shots = {
  'leftovers-gateway-create-user': { fixedHeight: null, prepare: preparation({ beforeSizing: leftovers(fillUser) }), temporaryResources: [gatewayApp] },
};
