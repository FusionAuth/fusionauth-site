import { preparation, projectRoot } from '../../kit.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fill, openDialog, pinOperateIds } from '../../deploy/_shared.mjs';

const fixture = file => readFileSync(join(projectRoot, 'screenshots/fixtures/operate', file), 'utf-8');

// screenshot id: [import type, key material]
const imports = {
  'operate-import-rsa-key-pair': ['rsa-pair', 'rsa'],
  'operate-import-rsa-private-key': ['rsa-private', 'rsa'],
  'operate-import-elliptic-curve-key-pair': ['ec-pair', 'ec'],
  'operate-import-ecc-private-key': ['ec-private', 'ec'],
  'operate-import-eddsa-key-pair': ['eddsa-pair', 'eddsa'],
  'operate-import-eddsa-private-key': ['eddsa-private', 'eddsa'],
  'operate-import-hmac-secret': ['hmac', 'hmac'],
  'operate-import-public-key': ['public', 'rsa'],
  'operate-import-certificate': ['certificate', 'rsa'],
};

// screenshot id: key algorithm
const generated = {
  'operate-generate-rsa-key-pair': 'RSA',
  'operate-generate-ecc-key-pair': 'EC',
  'operate-generate-eddsa-key-pair': 'OKP',
  'operate-generate-hmac-secret': 'HMAC',
};

// opens the import or generate dialog and fills in every field it shows
const fillKey = ({ type, material, algorithm }) => async page => {
  await openDialog(page, algorithm ? `/ajax/key/generate/${algorithm}` : `/ajax/key/import?t=${type}`);
  await fill(page, 'keyId', '00000000-0000-0000-0000-f60000000010');
  await fill(page, 'key_name', `Pied Piper ${algorithm ?? material.toUpperCase()} key`);
  if (await page.locator('#key_kid').count()) await fill(page, 'key_kid', 'pied-piper-signing-key');
  if (await page.locator('#key_issuer').count()) await fill(page, 'key_issuer', 'local.fusionauth.io');
  for (const part of ['public', 'private']) {
    if (await page.locator(`#key_${part}Key`).count()) await fill(page, `key_${part}Key`, fixture(`${material}-${part}.pem`));
  }
  if (type === 'certificate') await fill(page, 'key_certificate', fixture('certificate.pem'));
  if (type === 'hmac') await fill(page, 'key_secret', 'pied-piper-documentation-secret-not-for-production');
  await pinOperateIds(page);
};

const keyShot = key => ({ fixedHeight: null, prepare: preparation({ beforeSizing: fillKey(key) }) });

export const shots = {
  'operate-key-master-list': { prepare: preparation({ beforeSizing: pinOperateIds }) },
  ...Object.fromEntries(Object.entries(imports).map(([id, [type, material]]) => [id, keyShot({ type, material })])),
  ...Object.fromEntries(Object.entries(generated).map(([id, algorithm]) => [id, keyShot({ algorithm })])),
};
