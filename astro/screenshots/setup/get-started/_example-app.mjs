const exampleAppId = 'f1a3c5e7-9b2d-4f6a-8c0e-3b5d7f9a1c37';

const exampleApp = {
  order: 0,
  paths: [`/api/application/${exampleAppId}`],
  create: async api => {
    await api(`/api/application/${exampleAppId}`, 'POST', { application: { name: 'Example app', oauthConfiguration: {
      clientSecret: 'iPSWDLcZJ9QsX1WOKcNquACA5Nk2KlFzYx5hpuyXsuA',
      authorizedRedirectURLs: ['http://localhost:3000/oauth-redirect'], logoutURL: 'http://localhost:3000/logout',
      enabledGrants: ['authorization_code', 'refresh_token'], requireRegistration: true,
    } } });
  },
};

export { exampleAppId, exampleApp };
