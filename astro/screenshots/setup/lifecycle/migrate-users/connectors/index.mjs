import { migrationShot, connectorTenant } from '../_shared.mjs';

export const shots = {
  'migration-connectors-list': migrationShot({ temporaryResources: [connectorTenant] }),
  'migration-tenant-connector-policies': migrationShot({ band: "el-tab-list, [data-section='connector-settings']", temporaryResources: [connectorTenant] }),
};
