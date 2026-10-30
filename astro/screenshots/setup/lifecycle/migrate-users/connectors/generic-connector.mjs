import { selectTab } from '../../../kit.mjs';
import { migrationShot, windowShot } from '../_shared.mjs';

export const shots = {
  'migration-generic-connector-add': windowShot({}),
  'migration-generic-connector-security': migrationShot({ band: 'el-tab-list, #security', before: page => selectTab(page, 'Security') }),
  'migration-generic-connector-headers': migrationShot({ band: 'el-tab-list, #headers', before: page => selectTab(page, 'Headers') }),
};
