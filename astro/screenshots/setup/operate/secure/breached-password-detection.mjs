import { preparation } from '../../kit.mjs';
import { fill } from '../_shared.mjs';

const detection = { switch: ['tenant_passwordValidationRules_breachDetection_enabled'], fixedHeight: 'Breached password detection settings' };

export const shots = {
  'operate-turn-on-detection': { ...detection },
  'operate-breached-password-configuration-options': {
    ...detection,
    sectionBox: 'breached-password-detection-settings',
    prepare: preparation({ beforeSizing: page => fill(page, 'tenant_passwordValidationRules_breachDetection_onLogin', 'RequireChange') }),
  },
};
