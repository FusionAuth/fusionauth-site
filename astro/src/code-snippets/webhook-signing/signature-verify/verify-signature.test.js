// :snippet-start: verify-webhook-signature
// :state-start: published
const crypto = require("crypto");
const jose = require("jose");

const signatureHeader = 'X-FusionAuth-Signature-JWT';

async function verifyWebhookSignature(rawBody, jwtHeader, jwks) {
  const jwt = Buffer.from(jwtHeader || '', 'utf8');
  const { payload } = await jose.jwtVerify(jwt, jwks);
  const body_sha256 = crypto.createHash('sha256').update(rawBody).digest('base64');
  if (payload.request_body_sha256 !== body_sha256) {
    throw new Error('Body hash mismatch');
  }
}
// :state-end:
// :snippet-end:

// :remove-start:
describe('verifyWebhookSignature', () => {
  let privateKey;
  let publicKey;

  beforeAll(async () => {
    const keyPair = await jose.generateKeyPair('RS256');
    privateKey = keyPair.privateKey;
    publicKey = keyPair.publicKey;
  });

  async function signJwt(payload) {
    return new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256' })
      .sign(privateKey);
  }

  function localJwks() {
    return async () => publicKey;
  }

  test('accepts a valid signature', async () => {
    const body = Buffer.from(JSON.stringify({ event: { type: 'user.login' } }));
    const body_sha256 = crypto.createHash('sha256').update(body).digest('base64');
    const jwt = await signJwt({ request_body_sha256: body_sha256 });
    await expect(verifyWebhookSignature(body, jwt, localJwks())).resolves.toBeUndefined();
  });

  test('rejects when body hash does not match', async () => {
    const body = Buffer.from('{"event":{"type":"user.login"}}');
    const jwt = await signJwt({ request_body_sha256: 'wronghash' });
    await expect(verifyWebhookSignature(body, jwt, localJwks())).rejects.toThrow('Body hash mismatch');
  });

  test('rejects when JWT is invalid', async () => {
    const body = Buffer.from('{}');
    await expect(verifyWebhookSignature(body, 'not-a-jwt', localJwks())).rejects.toThrow();
  });

  test('rejects when signature header is missing', async () => {
    const body = Buffer.from('{}');
    await expect(verifyWebhookSignature(body, undefined, localJwks())).rejects.toThrow();
  });
});
// :remove-end:

// :remove-start:
const bodyParser = require('body-parser');
const express = require("express");

const port = 3030;
const webhookListenerPath = '/webhook';
const fusionauthJwksEndpoint = 'https://local.fusionauth.io/.well-known/jwks.json';

const cachedRemoteJWKS = jose.createRemoteJWKSet(new URL(fusionauthJwksEndpoint));

const app = express();
app.use(bodyParser.json({
  limit: '50mb',
  verify: function(req, res, buf) {
    req.rawBody = buf;
  }
}));

app.post(webhookListenerPath, async function (req, res) {
  const rawBody = req.rawBody;
  const jwtHeader = req.get(signatureHeader);
  try {
    await verifyWebhookSignature(rawBody, jwtHeader, cachedRemoteJWKS);
    res.json({ message: "Success" });
  } catch (err) {
    res.status(401).send('Unauthorized');
  }
});

if (require.main === module) {
  app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
  });
}
// :remove-end:
