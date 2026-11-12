import * as jose from 'jose';
import 'dotenv/config';

const jwksClient = jose.createRemoteJWKSet(new URL(`${process.env.BASE_URL}/.well-known/jwks.json`));

export async function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerMatch = authHeader ? authHeader.match(/^Bearer\s+(\S+)$/i) : null;
  const accessToken = bearerMatch ? bearerMatch[1] : null;
  if (!accessToken) return res.status(401).send({ error: 'Missing bearer token in authorization header' });
  try {
    await jose.jwtVerify(accessToken, jwksClient, {issuer: process.env.BASE_URL, audience: process.env.CLIENT_ID,});
    req.verifiedToken = accessToken;
    next();
  }
  catch (e) {
    if (e instanceof jose.errors.JOSEError) res.status(401).send({ error: e.message, code: e.code });
    else res.status(500).send({ error: JSON.stringify(e) });
  }
}

export function hasRole(...roles) {
  return (req, res, next) => {
    if (jose.decodeJwt(req.verifiedToken).roles?.some(role => roles.includes(role))) return next();
    res.status(403).send({ error: 'You do not have a role with permissions to do this.' });
  };
}