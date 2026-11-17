import express from 'express';
import { hasRole, verifyJWT } from './security.mjs';

const app = express();
const posts = new Map([
  ['00000000-0000-0000-0000-000000000001', { uuid: '00000000-0000-0000-0000-000000000001', userId: '00000000-0000-0000-0000-222222222222', text: 'Welcome to the forum.' }],
]);
app.use(express.json());
app.use(verifyJWT);

app.get('/read', hasRole('free', 'premium'), function (req, res) { return res.json([...posts.values()]); });

app.post('/write', hasRole('premium'), function (req, res) {
  const { uuid, text } = req.body;
  const userId = req.auth.sub;
  const post = posts.get(uuid);
  if (post && post.userId !== userId) return res.status(403).json({ error: 'You may edit only your own posts.' });
  posts.set(uuid, { uuid, userId, text });
  return res.json('Write successful');
});

app.listen(3000, () => { console.log('API available at http://localhost:3000'); });
