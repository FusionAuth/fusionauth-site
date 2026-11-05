import { fixedId, preparation } from '../../kit.mjs';
import { consentUrl, leftovers, reachConsent } from '../../get-started/_shared.mjs';

const moneyScopeAppId = '00000000-0000-0000-0000-f7000000000b';

// scope name: consent message
const bankingScopes = {
  'accounts.read': 'Basic account information and balances',
  'profile.read': 'User profile and contact information',
  'transactions.read': 'Transaction history and details',
  'transfers.write': 'Initiate money transfers between accounts',
  'payments.write': 'Make bill payments',
  'investments.read': 'Investment portfolio information',
  'investments.trade': 'Execute investment trades',
  'creditScore.read': 'Access credit score information',
};
const requiredScopes = ['accounts.read', 'profile.read', 'transactions.read'];

const moneyScopeApp = {
  order: 36,
  paths: [`/api/application/${moneyScopeAppId}`],
  create: async api => {
    await api(`/api/application/${moneyScopeAppId}`, 'POST', {
      application: {
        name: 'MoneyScope',
        oauthConfiguration: {
          authorizedRedirectURLs: ['https://local.fusionauth.io/callback'],
          enabledGrants: ['authorization_code'],
          relationship: 'ThirdParty',
          consentMode: 'AlwaysPrompt',
          providedScopePolicy: { profile: { enabled: true, required: true } },
        },
      },
    });
    for (const [i, [name, message]] of Object.entries(bankingScopes).entries()) {
      await api(`/api/application/${moneyScopeAppId}/scope/${fixedId('f70000000b', i)}`, 'POST', {
        scope: { name, description: message, defaultConsentMessage: message, required: requiredScopes.includes(name) },
      });
    }
  },
};

const consent = consentUrl(moneyScopeAppId, ['openid', 'profile', ...Object.keys(bankingScopes)]);

export const shots = {
  'leftovers-banking-scopes': { prepare: preparation({ beforeSizing: leftovers() }), temporaryResources: [moneyScopeApp] },
  'leftovers-banking-consent': { prepare: preparation({ beforeSizing: leftovers(reachConsent('banking-consent', consent)) }), temporaryResources: [moneyScopeApp] },
};
