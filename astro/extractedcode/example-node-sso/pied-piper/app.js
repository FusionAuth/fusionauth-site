var createError = require('http-errors');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');
require('dotenv').config();
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// :snippet-start: sessioncookie
// FusionAuth logout loads this app's /endsession route in a hidden cross-site iframe.
// browsers only send a cookie to a cross-site iframe when it's SameSite=None, and SameSite=None requires Secure.
// Secure cookies only travel over https, so this app must run behind TLS for logout to reach it.
// over plain http, express-session never sets a Secure cookie, so login loops back to FusionAuth.
// to try the example without TLS, set INSECURE_COOKIES=true in .env: login and SSO work, but logging out
// of the other app won't end this app's session.
const insecureCookies = process.env.INSECURE_COOKIES === 'true';
// trust X-Forwarded-Proto from a local TLS proxy, so req.secure is true behind the proxy
app.set('trust proxy', 1);
app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: 'fusionauth-node-example',
  cookie: {
    maxAge: 60 * 60 * 1000,
    sameSite: insecureCookies ? 'lax' : 'none',
    secure: !insecureCookies,
  },
}));
// :snippet-end:
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
