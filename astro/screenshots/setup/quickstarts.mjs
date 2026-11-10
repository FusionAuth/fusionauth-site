const quickstartAppId = '5c8e2f4a-7b1d-4e9c-a3f6-0d2b8e7c1a94';

// matches the QuickStart instances: self-service registration on, no passwordless or passkey login
const quickstartApp = {
  order: 0,
  paths: [`/api/application/${quickstartAppId}`],
  create: async api => {
    await api(`/api/application/${quickstartAppId}`, 'POST', { application: {
      name: 'Quick Start App',
      oauthConfiguration: { authorizedRedirectURLs: ['http://localhost:3000/oauth-redirect'], enabledGrants: ['authorization_code', 'refresh_token'] },
      registrationConfiguration: { enabled: true, type: 'basic', loginIdType: 'email' },
      webAuthnConfiguration: { enabled: true, bootstrapWorkflow: { enabled: false }, reauthenticationWorkflow: { enabled: false } },
    } });
  },
};

export const shots = {
  'quickstart-admin-dashboard': { fixedHeight: null },
  'quickstart-login': { temporaryResources: [quickstartApp] },
};
