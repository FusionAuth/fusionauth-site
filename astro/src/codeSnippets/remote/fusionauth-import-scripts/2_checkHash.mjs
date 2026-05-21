import * as crypto from 'crypto';

const password = 'averylongandunguessablepasswordwithlotsofrandominfooofisjoafasnr;,n2';
const salt = 'zKia-0BdIFKCzWbzXbj3qrhBnbiWNg==';
const hash = '8dg6AaIWPfcLTQU7lb4H-CI49dHeqaBXfFE1ogb2qRQ=';

const cost = 1 << 15;
const blockSize = 8;
const parallelization = 1;
const keyLength = 32;

crypto.scrypt(password, salt, keyLength, { N: cost, r: blockSize, p: parallelization, maxmem: 1024 * 1024 * 1024*50 }, (err, derivedKey) => {
  if (err) throw err;
  const keyBase64 = derivedKey.toString('base64'); //  .replace(/\+/g, '-').replace(/\//g, '_')
  console.log('Hash:', keyBase64);
  console.log('Matches provided hash:', keyBase64 === hash);
});