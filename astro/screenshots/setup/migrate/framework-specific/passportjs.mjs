import { piedPiperAppId } from '../../kit.mjs';
import { migration, windowShot, migrationOpenMenu, showLoginUrl, connectorResources, connectorShots } from '../_shared.mjs';

const googleIdp = {
  order: 15,
  paths: [`/api/identity-provider/${migration.googleIdpId}`],
  create: async api => {
    await api(`/api/identity-provider/${migration.googleIdpId}`, 'POST', { identityProvider: {
      type: 'Google', name: 'Google', enabled: true, client_id: 'piedpiper.apps.googleusercontent.com', client_secret: 'not-a-secret', buttonText: 'Login with Google', scope: 'profile email',
    } });
  },
};

export const shots = {
  'migration-passportjs-idp': windowShot({ temporaryResources: [googleIdp] }),
  'migration-connector-add-menu': windowShot({
    after: async (page, tag) => {
      await migrationOpenMenu(page, page.locator('main el-dropdown button').first());
      await tag('migration-add-generic', () => document.querySelector('[data-menu-copy] #add-generic'));
    },
  }),
  ...connectorShots('passportjs', [connectorResources('passportjs', 10)], { boxFields: true }),
  'migration-example-app-login-url': windowShot({ before: page => showLoginUrl(page, piedPiperAppId) }),
};
