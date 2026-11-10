import { idpShot, idpIntegrationDetails, piperChatId } from '../_shared.mjs';

export const shots = {
  'idp-login-azure-saml': idpShot({ login: 112 }),
  'idp-key-import-certificate': idpShot({ keyImport: { t: 'certificate' } }, { fixedHeight: null }),
  'idp-azure-saml-edit': idpShot({ scroll: 'identityProvider_name' }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-azure-saml-applications': idpShot({}, { band: 'el-tab-list, #applications' }),
  'idp-azure-saml-options': idpShot({}, { band: 'el-tab-list, #options' }),
  'idp-view-azure-saml': idpShot({ view: 112, viewBox: idpIntegrationDetails }, { fixedHeight: null }),
  'idp-app-oauth': idpShot({ scroll: 'application_oauthConfiguration_clientId', appOauth: true }, { fixedHeight: '[data-idp-scroll]' }),
  'idp-app-login-url': idpShot({ appView: piperChatId }, { fixedHeight: null }),
};
