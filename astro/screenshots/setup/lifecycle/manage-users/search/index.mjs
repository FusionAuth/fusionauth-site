import { preparation } from '../../../kit.mjs';

export const shots = {
  'manage-search-about-engine': {
    band: "[data-hl='system-panel']",
    prepare: preparation({
      beforeUserTabs: (page, ctx, { tag }) =>
        tag('system-panel', () => [...document.querySelectorAll('main h2')].find(h => h.textContent.trim() === 'System')?.closest('section, .panel, div.rounded-lg, div.bg-white')),
    }),
  },
};
