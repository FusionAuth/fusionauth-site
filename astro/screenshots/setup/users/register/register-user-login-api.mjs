import { registerShot, openSignedOut } from './_shared.mjs';

export const shots = {
  'register-login-page': registerShot({ before: openSignedOut }),
};
