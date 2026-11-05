import { preparation, baseUrl } from '../../kit.mjs';

// phone-otp: navigate to the passwordless form, enter an identifier, and submit
// to land on the OTP code-entry form (FormField strategy for phone passwordless)
async function phoneOtpForm(page, ctx, { pathname, fragment, oauthAppId }) {
  if (pathname.includes('/oauth2/authorize') && fragment === 'phone-otp') {
    try {
      await page.goto(`${baseUrl}/oauth2/passwordless?client_id=${oauthAppId}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth-callback&response_type=code&scope=openid`);
      await page.waitForLoadState('networkidle');
      // Big Head has mobilePhone in kickstart -- enter it to trigger the phone OTP flow
      await page.fill('#loginId', '+15555551234');
      // the passwordless form submit is a plain <button> with text "Send" -- no type or id attr
      await page.locator('form[action="/oauth2/passwordless"] button').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    } catch (e) {
      throw new Error(`phone otp flow failed: ${e.message}`, { cause: e });
    }
  }
}

export const shots = {
  'passwordless-application-enable': { legacyVersion: true },
  'passwordless-application-security': { legacyVersion: true },
  'passwordless-login-page': {},
  'passwordless-phone-otp-form': { prepare: preparation({ beforeSizing: phoneOtpForm }) },
};
