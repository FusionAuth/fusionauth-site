import { idpShot, piperChatId } from '../_shared.mjs';

export const shots = {
  'idp-hypr-add': idpShot({}, { switch: [`identityProvider_applicationConfiguration[${piperChatId}]_enabled`] }),
};
