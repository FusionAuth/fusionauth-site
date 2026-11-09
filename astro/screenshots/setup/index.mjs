import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import * as shared from './_shared.mjs';
import * as cimdDomains from './concepts/types/cimd-domains.mjs';
import * as tokenExchange from './authorization/token-exchange-delegation.mjs';
import * as accountManagement from './users/account-management/_shared.mjs';
import * as themes from './theme/_shared.mjs';
import * as oneTimePasswords from './authentication/one-time-passwords/_shared.mjs';
import * as webhooks from './events/_shared.mjs';
import * as tenantManager from './users/tenant-manager.mjs';

const dir = fileURLToPath(new URL('.', import.meta.url));
const paths = readdirSync(dir, { recursive: true }).filter(path => path.endsWith('.mjs') && !['index.mjs', 'kit.mjs'].includes(path)).sort();
export const modules = await Promise.all(paths.map(path => import(/* @vite-ignore */ new URL(path, import.meta.url))));

// the order beforeAll creates them in
export const resources = [
  shared.resources[0],
  cimdDomains.resources[0],
  tokenExchange.resources[0],
  accountManagement.resources[0],
  themes.resources[0],
  oneTimePasswords.resources[0],
  webhooks.resources[0],
  oneTimePasswords.resources[1],
  shared.resources[1],
  tenantManager.resources[0],
];
