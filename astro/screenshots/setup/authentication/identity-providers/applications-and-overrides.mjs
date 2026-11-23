import { idpShot, piperChatId } from './_shared.mjs';

export const shots = {
  'idp-google-applications': idpShot({ appRow: 'PiperChat' }),
  'idp-apple-overrides': idpShot({ overrides: piperChatId }, { band: 'el-tab-list, #applications' }),
};
