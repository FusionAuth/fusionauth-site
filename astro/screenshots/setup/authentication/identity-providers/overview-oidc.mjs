import { idpShot } from './_shared.mjs';

export const shots = {
  'idp-login-openid-connect': idpShot({ login: 106 }),
  'idp-oidc-add': idpShot({ fill: {
    identityProvider_name: 'Pied Piper', identityProvider_oauth2_client_id: '7a3906ee-b105-4ff9-bf9a-16df55c93f3f',
    identityProvider_oauth2_client_secret: '3uOQq-IxbZkh38KeI1AnoS9io5SnT3Np1vwqvGibWPs',
    identityProvider_oauth2_issuer: 'https://login.piedpiper.com', identityProvider_buttonText: 'Login with Pied Piper', identityProvider_oauth2_scope: 'openid',
  } }, { switch: ['useOpenIdDiscovery'], fixedHeight: null }),
  'idp-oidc-add-applications': idpShot({}, { band: 'el-tab-list, #applications' }),
  'idp-oidc-add-domains': idpShot({}, { band: 'el-tab-list, #domains' }),
  'idp-oidc-add-options': idpShot({}, { band: 'el-tab-list, #options' }),
};
