import { selectTab } from '../../../kit.mjs';
import { migrationShot, windowShot } from '../_shared.mjs';

export const shots = {
  'migration-ldap-connector-add': windowShot({}),
  'migration-ldap-connector-directory': migrationShot({ band: 'el-tab-list, #directory-configuration', before: page => selectTab(page, 'Directory') }),
};
