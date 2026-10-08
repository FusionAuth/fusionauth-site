var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');
var path = require('path');
var logger = require('morgan');
var dotenv = require('dotenv').config();

// :snippet-start: tsClientLib
const client = require('@fusionauth/typescript-client');
const apikey = process.env.API_KEY;
const fusionAuthURL = process.env.BASE_URL;
// :snippet-end:

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressSession({resave: false, saveUninitialized: false, secret: 'fusionauth-node-example'}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// :snippet-start: intercom
app.post('/intercom', function(req, res) {
  console.log('Incoming Request to Intercom:');
  console.log(req.body);
  console.log('');
  res.sendStatus(200);
});
// :snippet-end:

// :snippet-start: slack
app.post('/slack', function(req, res) {
  console.log('Incoming Request to Slack:');
  console.log(req.body);
  console.log('');
  res.sendStatus(200);
});
// :snippet-end:

// :snippet-start: expire
app.post('/expire', async function(req, res) {
  console.log('Incoming Request to PiedPiper Expiry:');
  console.log(req.body);
  console.log('');
  if (req.body.event.action === 'Subscribe' && req.body.event.phase === 'end') {
    try {
      const request = {
        action: {
          actioneeUserId: req.body.event.actioneeUserId,
          actionerUserId: req.body.event.actionerUserId,
          applicationIds: ['e9fdb985-9173-4e01-9d73-ac2d60d1dc8e'],
          emailUser: false,
          expiry: 8223372036854775806, // the end of time
          notifyUser: false,
          reasonId: '28b0dd40-3a65-48ae-8eb3-4d63d253180a', // subscription expired reason
          userActionId: 'b96a0548-e87c-42dd-887c-31294ca10c8b' //ban action
        },
        broadcast: false
      };
      const fusion = new client.FusionAuthClient(apikey, fusionAuthURL);
      const clientResponse = await fusion.actionUser(request);
      if (!clientResponse.wasSuccessful)
        throw Error(clientResponse);
      console.info('User banned successfully');
    }
    catch (e) {
      console.error('Error handling expiry: ');
      console.dir(e, { depth: null });
    }
  }
  res.sendStatus(200);
});
// :snippet-end:

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
