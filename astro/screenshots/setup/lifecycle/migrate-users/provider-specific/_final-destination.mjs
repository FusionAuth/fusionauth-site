import { migration, windowShot, openDeleteMenu } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = {
  'migration-tenant-delete': windowShot({ after: (page, tag) => openDeleteMenu(page, tag, page.locator('main tbody tr', { hasText: migration.importTenantId })), temporaryResources: [importTenant] }),
};
