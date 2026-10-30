import { authShot, auth } from './_shared.mjs';
import { normalizeUserMethods } from '../../_shared.mjs';
import { piedPiperAppId } from '../../kit.mjs';

const hooliApp = {
  order: 21,
  paths: [`/api/application/${auth.hooliAppId}`],
  create: async api => {
    await api(`/api/application/${auth.hooliAppId}`, 'POST', { application: { name: 'Hooli', oauthConfiguration: {
      authorizedRedirectURLs: ['http://hooli.local:3001/oauth-redirect'], logoutURL: 'http://hooli.local:3001/endsession', enabledGrants: ['authorization_code', 'refresh_token'],
    } } });
    await api('/api/user/registration/00000000-0000-0000-0000-100000000004', 'POST', { registration: { applicationId: auth.hooliAppId } });
  },
};

export const shots = {
  'authenticate-application-add-pied-piper-oauth': authShot({
    select: { application_name: 'Pied Piper', application_oauthConfiguration_logoutURL: 'http://piedpiper.local:3000/endsession' },
    fixedHeight: '#application_oauthConfiguration_clientId-form-row',
  }, async (page, ctx, { showTab, addTokens, setClientSecret }) => {
    await showTab();
    await page.locator('#application_oauthConfiguration_clientId').evaluateAll((fields, id) => fields.forEach(field => { field.value = id; }), piedPiperAppId);
    await setClientSecret('this-is-not-a-secret-its-for-screenshots');
    await addTokens('redirectURLs-display', ['http://piedpiper.local:3000/oauth-redirect']);
  }),
  'authenticate-application-view-client-credentials': authShot({ fixedHeight: null }, async (page, ctx, { box, openView, row }) => {
    await openView(`/ajax/application/view/${piedPiperAppId}`, 'OAuth configuration');
    await box('client-credentials', [await row('id', 'Client Id:'), await row('secret', 'Client secret:')]);
  }),
  'authenticate-user-registrations-sso': authShot({ fixedHeight: null, temporaryResources: [hooliApp] }, page => page.waitForTimeout(500), { normalizeUser: normalizeUserMethods }),
  'authenticate-application-oauth-logout-behavior': authShot({
    select: { application_oauthConfiguration_logoutBehavior: 'RedirectOnly' },
    band: 'el-tab-list, #application_oauthConfiguration_logoutBehavior-form-row',
  }),
};
