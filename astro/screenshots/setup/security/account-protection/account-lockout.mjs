import { authShot, auth } from '../../authentication/_shared.mjs';
import { tabsReady, richardId } from '../../kit.mjs';

const lockedAccount = {
  order: 19,
  paths: [`/api/user/${auth.jaredId}?hardDelete=true`, `/api/user-action/${auth.lockActionId}?hardDelete=true`],
  create: async api => {
    await api(`/api/user-action/${auth.lockActionId}`, 'POST', { userAction: { name: 'Account Lock', temporal: true, preventLogin: true, sendEndEvent: true } });
    await api(`/api/user/${auth.jaredId}`, 'POST', { user: { email: 'jared@piedpiper.com', password: 'password', firstName: 'Jared', lastName: 'Dunn' } });
    await api('/api/user/action', 'POST', { broadcast: false, action: {
      actioneeUserId: auth.jaredId, actionerUserId: richardId, userActionId: auth.lockActionId, comment: 'Failed login attempts exceeded', expiry: Date.now() + 3 * 60000,
    } });
  },
};

export const shots = {
  'authenticate-account-lock-user-action': authShot({ fixedHeight: null, temporaryResources: [lockedAccount] }),
  'authenticate-account-lock-tenant-settings': authShot({
    select: {
      tenant_failedAuthenticationConfiguration_userActionId: auth.lockActionId, tenant_failedAuthenticationConfiguration_tooManyAttempts: '5',
      tenant_failedAuthenticationConfiguration_resetCountInSeconds: '60', tenant_failedAuthenticationConfiguration_actionDuration: '3',
      tenant_failedAuthenticationConfiguration_actionDurationUnit: 'MINUTES',
    },
    fixedHeight: null,
    sectionBox: 'failed-authentication-settings',
    temporaryResources: [lockedAccount],
  }),
  'authenticate-account-lock-user-view': authShot({ signedOut: true, keepAlerts: true, temporaryResources: [lockedAccount] },
    (page, ctx, { hostedLogin }) => hostedLogin('jared@piedpiper.com')),
  'authenticate-account-lock-admin-view': authShot({ fixedHeight: null, temporaryResources: [lockedAccount] }, async page => {
    await tabsReady(page);
    await page.addStyleTag({ content: '#current-actions table { table-layout: fixed; width: 100%; } #current-actions th, #current-actions td { white-space: normal; overflow-wrap: anywhere; }' });
    await page.waitForTimeout(500);
  }),
};
