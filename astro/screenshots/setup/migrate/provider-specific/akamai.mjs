import { windowShot, connectorResources, connectorShots } from '../_shared.mjs';

export const shots = {
  'migration-example-app-roles': windowShot({
    before: (page, tag) => tag('migration-roles', () => document.querySelector('main tbody')),
    after: page => page.evaluate(() => [...document.querySelectorAll('main tbody tr')].forEach((row, index) => {
      const cell = row.querySelectorAll('td')[1];
      if (cell) cell.textContent = `00000000-0000-0000-0000-f100000000b${index}`;
    })),
  }),
  ...connectorShots('akamai', [connectorResources('akamai', 8)], { boxFields: true }),
};
