import express from 'express';
import jose from 'jose';
import dotenv from 'dotenv/config';
import cookieParser from 'cookie-parser';

const app = express();
const router = express.Router();
const data = new Set('1');
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use('/', router);
app.use(verifyJWT);

router.get('/', function (req, res, next) { res.json({ title: 'Express API' }); });

router.get('/read', function (req, res) { return res.json([...data]); });

router.post('/write',  function (req, res) {
  if (!req.body.value) { return res.status(400).json({ error: 'Provide a value to write.' }); }
  data.add(req.body.value);
  return res.json('Write successful');
});

app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });

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
  const tokenFromHeader = bearerMatch ? bearerMatch[1] : null;
  const access_token = req.cookies['app.at'] || tokenFromHeader;
  if (!access_token) {
    res.status(401);
    res.send({ error: 'Missing token cookie and Authorization header' });
  } else {
    try {
      const result = await jose.jwtVerify(access_token, jwksClient, {
        issuer: process.env.BASE_URL,
        audience: process.env.CLIENT_ID,
      });
      req.verifiedToken = access_token;
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

// curl localhost:3000/read
// curl -X POST http://localhost:3000/write -H 'Content-Type: application/json' -d '{"value":"hello"}'

// :snippet-start: verifyToken
// :snippet-end:
