import { preparation } from '../../kit.mjs';
import { authorizeUrl, openHostedPage, leftovers } from './_shared.mjs';

const mcpAppId = '00000000-0000-0000-0000-f7000000000c';

const mcpApp = {
  order: 37,
  paths: [`/api/application/${mcpAppId}`],
  create: async api => {
    await api(`/api/application/${mcpAppId}`, 'POST', { application: { name: 'Pied Piper MCP', oauthConfiguration: {
      authorizedRedirectURLs: ['https://local.fusionauth.io/callback'], enabledGrants: ['authorization_code'], relationship: 'ThirdParty', consentMode: 'AlwaysPrompt',
      providedScopePolicy: { profile: { enabled: true, required: false } },
    } } });
    const message = 'Allow this application to read your name';
    await api(`/api/application/${mcpAppId}/scope/00000000-0000-0000-0000-f70000000c00`, 'POST', { scope: { name: 'get_name', description: message, defaultConsentMessage: message, required: true } });
  },
};

export const shots = {
  'leftovers-mcp-consent': {
    prepare: preparation({ beforeSizing: leftovers(page => openHostedPage(page, 'mcp-consent', authorizeUrl(mcpAppId, 'openid%20profile%20get_name'), { signIn: true })) }),
    temporaryResources: [mcpApp],
  },
};
