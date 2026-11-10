import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-google': idpShot({ login: 133 }),
  'idp-google-configuration': idpShot(),
  'idp-google-options': idpShot({}, { band: 'el-tab-list, #options' }),
};
