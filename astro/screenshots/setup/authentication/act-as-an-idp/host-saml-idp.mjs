import { authShot } from '../_shared.mjs';
import { piedPiperAppId } from '../../kit.mjs';

export const shots = {
  'authenticate-application-saml-enabled': authShot({ switch: ['application_samlv2Configuration_enabled'], fixedHeight: null }),
  'authenticate-application-saml-authentication': authShot({
    switch: ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_requireSignedRequests', 'application_samlv2Configuration_initiatedLogin_enabled'],
    fixedHeight: 'Authentication request',
  }),
  'authenticate-application-saml-logout': authShot({
    switch: ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_logout_requireSignedRequests', 'application_samlv2Configuration_logout_singleLogout_enabled'],
    fixedHeight: 'Logout request',
  }),
  'authenticate-application-saml-encryption': authShot({
    switch: ['application_samlv2Configuration_enabled', 'application_samlv2Configuration_assertionEncryptionConfiguration_enabled'],
    fixedHeight: 'Assertion encryption',
  }),
  'authenticate-application-list-view-menu': authShot({}, async (page, ctx, { freezeMenu }) => {
    await page.evaluate(id => {
      const link = document.querySelector(`main a[href="/ajax/application/view/${id}"]`);
      link?.closest('[popover]')?.showPopover();
      if (link) link.dataset.hl = 'view';
    }, piedPiperAppId);
    await page.waitForTimeout(500);
    await freezeMenu("[popover]:has([data-hl='view'])");
  }),
};
