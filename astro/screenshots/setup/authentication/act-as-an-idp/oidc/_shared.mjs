import { auth } from '../../_shared.mjs';

// named by the screenshot's resourceArgs
const signingKey = {
  order: 22,
  paths: [`/api/key/${auth.tableauKeyId}`],
  create: async (api, keyName) => {
    await api(`/api/key/generate/${auth.tableauKeyId}`, 'POST', { key: { algorithm: 'RS256', name: keyName, length: 2048 } });
  },
};

// the JWT tab with the signing key chosen for both tokens
const useSigningKey = label => async (page, ctx, { box, showTab }) => {
  await showTab();
  await page.evaluate(([id, label]) => {
    for (const key of ['accessTokenKeyId', 'idTokenKeyId']) {
      document.getElementById(`${key}-input`).value = `${label} RS256 Key (RS256)`;
      document.querySelector(`#${key} input[type=hidden]`).value = id;
    }
  }, [auth.tableauKeyId, label]);
  await box('signing-keys', ['#accessTokenKeyId', '#idTokenKeyId'], 8);
};

export { signingKey, useSigningKey };
