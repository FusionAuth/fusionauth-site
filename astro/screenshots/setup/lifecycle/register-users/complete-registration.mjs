import { registerShot } from './_shared.mjs';

export const shots = {
  'register-complete-registration-settings': registerShot({ fixedHeight: '.tab-list-container', before: page => page.selectOption('#selfRegistrationType', 'Complete') }),
};
