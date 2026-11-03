import { preparation } from '../../kit.mjs';
import { leftovers } from '../../get-started/_shared.mjs';

export const shots = {
  'leftovers-api-key-manager': {
    switch: ['apiKey_keyManager'],
    fixedHeight: null,
    prepare: preparation({ beforeSizing: leftovers(page => page.fill('#apiKey_key', 'pied-piper-example-key-manager')) }),
  },
};
