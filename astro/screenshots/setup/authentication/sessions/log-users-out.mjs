import { authShot } from '../_shared.mjs';

export const shots = {
  'authenticate-application-oauth-logout-behavior': authShot({
    select: { application_oauthConfiguration_logoutBehavior: 'RedirectOnly' },
    band: 'el-tab-list, #application_oauthConfiguration_logoutBehavior-form-row',
  }),
};
