import { preparation, piedPiperThemeId } from '../kit.mjs';
import { selectTheme } from './_shared.mjs';

export const shots = {
  'theme-apply-tenant': { fixedHeight: null, themeSelect: piedPiperThemeId, legacyVersion: true, prepare: preparation({ afterControls: selectTheme }) },
};
