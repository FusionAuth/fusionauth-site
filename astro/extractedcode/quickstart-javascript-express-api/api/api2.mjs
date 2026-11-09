import express from 'express';

const app = express();
const router = express.Router();
const data = new Set('1');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', router);

router.get('/', function (req, res, next) { res.json({ title: 'Express API' }); });

router.get('/read', function (req, res) { return res.json([...data]); });

router.post('/write',  function (req, res) {
  if (!req.body.value) { return res.status(400).json({ error: 'Provide a value to write.' }); }
  data.add(req.body.value);
  return res.json('Write successful');
});

app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });


// curl localhost:3000/read
// curl -X POST http://localhost:3000/write -H 'Content-Type: application/json' -d '{"value":"hello"}'