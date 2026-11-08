import { preparation } from '../kit.mjs';
import { fillFields } from './_shared.mjs';

export const shots = {
  'manage-cleanspeak-integration': {
    fixedHeight: null,
    prepare: preparation({ beforeUserTabs: fillFields({
      integrations_cleanspeak_enabled: true, integrations_cleanspeak_url: 'http://localhost:8001', integrations_cleanspeak_apiKey: 'b44395a7-e5a8-4a41-b73a-364576277c0d',
      integrations_cleanspeak_usernameModeration_enabled: true,
    }) }),
  },
};
