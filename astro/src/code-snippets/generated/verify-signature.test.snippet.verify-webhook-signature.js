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
