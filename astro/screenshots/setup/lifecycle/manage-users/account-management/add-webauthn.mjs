import { preparation } from '../../../kit.mjs';

export const shots = {
  'account-tenant-webauthn': { fixedHeight: null, sectionBox: 'bootstrap-passkey-authentication', legacyVersion: true },
  'account-home': {},
  'account-passkey-add': { prepare: preparation({ beforeUserTabs: page => page.getByLabel('Display name').fill('Safari Touch ID') }) },
};
