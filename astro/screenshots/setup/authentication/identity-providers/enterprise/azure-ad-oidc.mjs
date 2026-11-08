import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-azure-oidc': idpShot({ login: 102 }),
  'idp-azure-oidc-edit': idpShot({ fill: {
    identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/azure-ad.svg',
    identityProvider_oauth2_issuer: 'https://login.microsoftonline.com/4b5d74a0-c612-459d-91ac-26fbff2b27bc/v2.0',
  } }, { switch: ['useOpenIdDiscovery'], fixedHeight: null }),
  'idp-azure-oidc-applications': idpShot({}, { band: 'el-tab-list, #applications' }),
};
