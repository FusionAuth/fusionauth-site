var express = require('express');
var router = express.Router();
const hasRole = require('../services/hasRole');

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/panic', hasRole(['teller']), function (req, res, next) {
  res.json({ message: "We've called the police!" });
});

router.get('/make-change', hasRole(['customer', 'teller']), function (req, res, next) {
  const amount = req.query.total;
  const error = ! /^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(amount);
  if (error)
    return res.status(400).json({ error: 'Invalid or missing "total" parameter' })
  const result = { total: 0, nickels: 0, pennies: 0};
  const totalCents = Math.round(parseFloat(amount)*100);
  result.total = totalCents/100;
  result.nickels = Math.floor(totalCents / 5);
  result.pennies = totalCents - (result.nickels * 5);
  res.json(result);
});

module.exports = router;
