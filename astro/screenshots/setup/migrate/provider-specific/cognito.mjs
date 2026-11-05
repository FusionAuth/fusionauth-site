import { connectorResources, connectorShots } from '../_shared.mjs';
import { importTenant, permissionsShot } from './_shared.mjs';

export const shots = {
  ...connectorShots('cognito', [importTenant, connectorResources('cognito', 14)]),
  'migration-api-key-permissions-change-password': permissionsShot('/api/user/change-password'),
};
