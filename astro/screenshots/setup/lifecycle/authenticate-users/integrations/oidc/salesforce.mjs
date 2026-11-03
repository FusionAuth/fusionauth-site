import { authShot, auth } from '../../_shared.mjs';

const salesforceApp = {
  order: 24,
  paths: [`/api/application/${auth.salesforceAppId}`],
  create: async api => {
    await api(`/api/application/${auth.salesforceAppId}`, 'POST', { application: { name: 'Salesforce', oauthConfiguration: {
      clientSecret: 'salesforce-secret-not-for-production', enabledGrants: ['authorization_code', 'refresh_token'],
      authorizedRedirectURLs: ['https://your-application.my.salesforce.com/services/authcallback/FusionAuth'],
      logoutURL: 'https://your-application.my.salesforce.com/services/auth/rp/oidc/logout',
    } } });
  },
};

export const shots = {
  'authenticate-salesforce-application-add': authShot({ select: { application_name: 'Salesforce' }, fixedHeight: null }),
  'authenticate-salesforce-application-oauth': authShot({ fixedHeight: '#application_oauthConfiguration_clientId-form-row', temporaryResources: [salesforceApp] }),
};
