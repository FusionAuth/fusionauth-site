var express = require('express');
var router = express.Router();
const hasPermission = require('../services/hasPermission');

require('dotenv/config');
const API_ENTITY_ID = process.env.API_ENTITY_ID;

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/api/news', hasPermission(API_ENTITY_ID,'news'), function (req, res, next) {
  res.json({ news: [ { title: "news item", description: "news description" }]});
});

router.get('/api/weather', hasPermission(API_ENTITY_ID,'weather'), function (req, res, next) {
  res.json({ weather: { description: "weather description", high: 30, low: 10 }});
});

module.exports = router;
