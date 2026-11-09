import express from 'express';
import * as jose from 'jose';
import dotenv from 'dotenv/config';

const app = express();
const router = express.Router();
const data = new Set('1');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.get('/', function (req, res, next) { res.json({ title: 'Express API' }); });

router.get('/read', hasRole('reader'), function (req, res) { return res.json([...data]); });

router.post('/write', hasRole('writer'), function (req, res) {
  if (!req.body.value) { return res.status(400).json({ error: 'Provide a value to write.' }); }
  data.add(req.body.value);
  return res.json('Write successful');
});


function hasRole(role) {
  return (req, res, next) => {
    if (jose.decodeJwt(req.verifiedToken).roles.includes(role)) return next();
    res.status(403).send({ error: 'You do not have a role with permissions to do this.' });
  }
}

const jwksClient = jose.createRemoteJWKSet(new URL(`${process.env.BASE_URL}/.well-known/jwks.json`));

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const bearerMatch = authHeader ? authHeader.match(/^Bearer\s+(\S+)$/i) : null;
  const accessToken = bearerMatch ? bearerMatch[1] : null;
  if (!accessToken) {
    return res.status(401).send({ error: 'Missing bearer token in authorization header' });
  } else {
    try {
      await jose.jwtVerify(accessToken, jwksClient, {
        issuer: process.env.BASE_URL,
        audience: process.env.CLIENT_ID,
      });
      req.verifiedToken = accessToken;
      next();
    } catch (e) {
      if (e instanceof jose.errors.JOSEError) {
        res.status(401);
        res.send({ error: e.message, code: e.code });
      } else {
        console.dir(`Internal server error: ${e}`);
        res.status(500);
        res.send({ error: JSON.stringify(e) });
      }
    }
  }
};

app.use(verifyJWT);
app.use('/', router);
app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });



// :snippet-start: verifyToken
// :snippet-end:
