import express from 'express';
import { hasRole, verifyJWT } from './security.mjs';

const app = express();
const router = express.Router();
const data = new Set('1');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.get('/read', hasRole('reader'), function (req, res) { return res.json([...data]); });

router.post('/write', hasRole('writer'), function (req, res) {
  if (!req.body.value) { return res.status(400).json({ error: 'Provide a value to write.' }); }
  data.add(req.body.value);
  return res.json('Write successful');
});

app.use(verifyJWT);
app.use('/', router);
app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });