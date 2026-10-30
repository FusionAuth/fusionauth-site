import { preparation } from '../../kit.mjs';

async function fillUser(page) {
  await page.fill('#user_email', 'test@example.com');
  await page.fill('#user_password', 'password');
  await page.fill('#confirm_user_password', 'password');
}

export const shots = {
  'segment-add-user': { fixedHeight: null, legacyVersion: true, prepare: preparation({ beforeUserTabs: fillUser }) },
};
