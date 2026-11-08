import { windowShot, connectorResources, connectorShots } from '../_shared.mjs';
import { importTenant, permissionsShot } from './_shared.mjs';

export const shots = {
  ...connectorShots('azureadb2c', [importTenant, connectorResources('azureadb2c', 13)]),
  'migration-import-tenant-add-policy': windowShot({ before: (page, tag) => tag('migration-add-policy', () => document.getElementById('add-connector-policy')), temporaryResources: [importTenant] }),
  'migration-api-key-permissions-forgot-password': permissionsShot('/api/user/forgot-password'),
};
