import { windowShot } from '../_shared.mjs';
import { importTenant, fillImportKey, permissionsShot } from './_shared.mjs';

export const shots = {
  'migration-api-key-add': windowShot({ before: fillImportKey, temporaryResources: [importTenant] }),
  'migration-api-key-permissions-social': permissionsShot('/api/user/search', '/api/identity-provider/link'),
};
