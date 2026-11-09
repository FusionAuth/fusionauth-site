import { connectorResources, connectorShots } from '../_shared.mjs';
import { importTenant } from './_shared.mjs';

export const shots = connectorShots('pingone', [importTenant, connectorResources('pingone', 12)]);
