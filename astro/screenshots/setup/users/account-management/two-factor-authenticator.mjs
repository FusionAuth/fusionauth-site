import { pinTotp, preparation, apiRequest, richardId, totpSecret, totpCode, removeTwoFactor } from '../../kit.mjs';

const richardAuthenticator = {
  order: 6,
  apply: async () => {
    await apiRequest(`/api/user/two-factor/${richardId}`, 'POST', { method: 'authenticator', secret: totpSecret.toString('base64'), code: totpCode() });
    return removeTwoFactor;
  },
};

// the secret in the page is swapped for the fixed one
async function pinnedSecret(page) {
  await pinTotp(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.unrouteAll();
}

async function signIn(page) {
  await page.fill('#loginId', 'richard@piedpiper.com');
  await page.fill('#password', 'password');
  await page.locator('#submit-button').click();
  await page.waitForURL(/\/oauth2\/two-factor/);
  await page.waitForLoadState('networkidle');
}

export const shots = {
  'account-tenant-mfa': {},
  'account-two-factor-authenticator': { prepare: preparation({ beforeUserTabs: pinnedSecret }) },
  'account-two-factor-challenge': { prepare: preparation({ beforeUserTabs: signIn }), temporaryState: [richardAuthenticator] },
};
