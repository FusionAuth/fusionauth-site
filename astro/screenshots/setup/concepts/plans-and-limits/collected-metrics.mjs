import { preparation } from '../../kit.mjs';
import { leftovers } from '../../get-started/_shared.mjs';

export const shots = {
  'leftovers-usage-data-collection': { switch: ['systemConfiguration_usageDataConfiguration_enabled'], fixedHeight: null, prepare: preparation({ beforeSizing: leftovers() }) },
};
