import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-github': idpShot({ login: 105 }),
  'idp-github-edit': idpShot({ fill: { identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/github.svg' } }),
};
