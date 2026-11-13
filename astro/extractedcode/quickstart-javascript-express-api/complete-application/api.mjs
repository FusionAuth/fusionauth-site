import express from 'express';
import * as jose from 'jose';
import { hasRole, verifyJWT } from './security.mjs';

const app = express();
const router = express.Router();
const posts = new Map([
  ['00000000-0000-0000-0000-000000000001', { uuid: '00000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-222222222222', text: 'Welcome to the forum.' }],
]);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.get('/read', hasRole('free', 'premium'), function (req, res) { return res.json([...posts.values()]); });

router.post('/write', hasRole('premium'), function (req, res) {
  const userId = jose.decodeJwt(req.verifiedToken).sub;
  const post = posts.get(req.body.uuid);
  if (post && post.userId !== userId) return res.status(403).json({ error: 'You may edit only your own posts.' });
  posts.set(req.body.uuid, { uuid: req.body.uuid, userId, text: req.body.text });
  return res.json('Write successful');
});

app.use(verifyJWT);
app.use('/', router);
app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });