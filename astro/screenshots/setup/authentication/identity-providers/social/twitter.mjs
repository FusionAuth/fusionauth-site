import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-twitter': idpShot({ login: 135 }),
  'idp-add-menu-twitter': idpShot({ menu: 'add/Twitter' }, { fixedHeight: null }),
  'idp-twitter-configuration': idpShot(),
};
