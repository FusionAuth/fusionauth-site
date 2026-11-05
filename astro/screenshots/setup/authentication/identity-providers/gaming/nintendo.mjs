import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-nintendo': idpShot({ login: 142 }),
  'idp-nintendo-configuration': idpShot(),
  'idp-nintendo-options': idpShot({}, { band: 'el-tab-list, #options' }),
};
