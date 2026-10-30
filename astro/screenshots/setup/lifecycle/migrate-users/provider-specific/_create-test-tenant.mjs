import { migration, migrationShot } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = {
  'migration-tenant-list-add': migrationShot({}),
  'migration-tenant-add': migrationShot({ stages: { afterAccount: page => page.fill('#tenant_name', 'Import test') } }),
  'migration-tenant-list': migrationShot({
    before: (page, tag) => tag('import-tenant-id', new Function(`return () => [...document.querySelectorAll('td')].find(td => td.textContent.trim() === '${migration.importTenantId}')`)()),
    temporaryResources: [importTenant],
  }),
};
