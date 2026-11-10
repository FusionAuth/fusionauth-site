import { authShot } from '../_shared.mjs';

export const shots = {
  'authenticate-application-oauth-refresh-grant': authShot({
    switch: ['application_oauthConfiguration_generateRefreshTokens'],
    fixedHeight: '#application_oauthConfiguration_clientAuthenticationPolicy-form-row',
  }, async (page, ctx, { showTab }) => {
    await showTab();
    await page.evaluate(() => {
      const grant = document.querySelector('#enabled-grants input[value=refresh_token]');
      if (!grant.checked) grant.click();
      grant.closest('.checkbox').dataset.hl = 'refresh-grant';
    });
  }),
  'authenticate-application-security-login-api-refresh': authShot({
    switch: ['application_loginConfiguration_generateRefreshTokens', 'application_loginConfiguration_allowTokenRefresh'],
    band: "[data-section='login-api-settings']",
  }),
};
