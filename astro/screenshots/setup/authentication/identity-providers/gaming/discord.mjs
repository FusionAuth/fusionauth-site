import { idpShot } from '../_shared.mjs';

export const shots = {
  'idp-login-discord': idpShot({ login: 104 }),
  'idp-discord-options': idpShot({}, { band: 'el-tab-list, #options' }),
  'idp-discord-edit': idpShot({ fill: { identityProvider_buttonImageURL: 'https://piperchat.piedpiper.com/images/discord.svg' } }, { fixedHeight: null }),
  'idp-discord-applications': idpShot({}, { band: 'el-tab-list, #applications' }),
};
