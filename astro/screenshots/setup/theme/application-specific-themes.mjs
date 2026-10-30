import { preparation, piedPiperThemeId } from '../kit.mjs';
import { selectTheme } from './_shared.mjs';

async function tagPiedPiperRow(page) {
  const tagged = await page.evaluate(name => {
    const row = [...document.querySelectorAll('tbody tr')].find(tr => tr.querySelector('td')?.textContent.trim() === name);
    if (row) row.dataset.hl = 'theme-row';
    return !!row;
  }, 'Pied Piper');
  if (!tagged) throw new Error('Pied Piper theme row not found');
}

export const shots = {
  'theme-add': { legacyVersion: true, prepare: preparation({ afterControls: tagPiedPiperRow }) },
  'theme-apply-application': { fixedHeight: null, themeSelect: piedPiperThemeId, legacyVersion: true, prepare: preparation({ afterControls: selectTheme }) },
  'theme-example-page': {},
};
