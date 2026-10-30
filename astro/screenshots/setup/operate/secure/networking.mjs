import { preparation } from '../../kit.mjs';
import { fill } from '../_shared.mjs';

export const shots = {
  'operate-networking-settings': { fixedHeight: null, prepare: preparation({ beforeSizing: page => fill(page, 'systemConfiguration_trustedProxyConfiguration_trustPolicy', 'OnlyConfigured') }) },
};
