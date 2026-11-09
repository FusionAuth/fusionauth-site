import express from 'express';

const app = express();
const router = express.Router();
app.use('/', router);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.get('/', function (req, res, next) { res.json({ title: 'Express API' }); });

app.listen(3000, '0.0.0.0', () => { console.log(`API available at http://localhost:3000`); });