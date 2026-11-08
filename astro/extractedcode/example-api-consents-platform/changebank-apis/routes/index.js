var express = require('express');
var router = express.Router();
const hasScope = require('../services/hasScope');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// :snippet-start: routes
router.get('/read-balance', hasScope('accounts.read'), function (req, res, next) {
  res.json({ balance: 42 });
});
router.post('/make-transfer', hasScope('transfers.write'), function (req, res, next) {
  const amount = req.query.newbalance;

  // update balance

  res.json({ message: "ok"});
});
// :snippet-end:

module.exports = router;
