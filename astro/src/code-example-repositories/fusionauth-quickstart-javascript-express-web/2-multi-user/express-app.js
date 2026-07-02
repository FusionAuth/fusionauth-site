const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;

// set up a directory for multi-user files
const DATA_DIR = path.join(__dirname, 'user_data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// auth dependencies
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');

// read configuration from .env file
require('dotenv').config();
const FUSIONAUTH_URL = 'http://localhost:9011';
const CLIENT_ID = process.env.FUSIONAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.FUSIONAUTH_CLIENT_SECRET;
const CALLBACK_URL = process.env.FUSIONAUTH_CALLBACK_URL;

// tell passport how to talk to fusionauth
passport.use('fusionauth', new OAuth2Strategy({
    authorizationURL: `${FUSIONAUTH_URL}/oauth2/authorize`,
    tokenURL: `${FUSIONAUTH_URL}/oauth2/token`,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    pkce: true,
    state: true,
    scope: ['openid', 'profile', 'email']
}, (accessToken, refreshToken, params, profile, cb) => {
    const idToken = params.id_token;
    const decoded = jwt.decode(idToken);

    const firstName = decoded.given_name || '';
    const lastName = decoded.family_name || '';
    const fullName = `${firstName} ${lastName}`.trim();

    const user = {
       id: decoded.sub,
       email: decoded.email,
       name: fullName || decoded.email || 'User'
    };

    return cb(null, user);
}));

// remember users via the session cookie
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// require authentication to access
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

// helper to get specific user file
const getUserFile = (id) => path.join(DATA_DIR, `note-${id}.txt`);

// --- routes ---
app.get('/login', passport.authenticate('fusionauth', {
    scope: ['openid', 'profile', 'email']
}));

app.get('/oauth-callback',
    passport.authenticate('fusionauth', { failureRedirect: '/login' }),
    (req, res) => res.redirect('/')
);

app.get('/logout', (req, res, next) => {
    // Clear the local Express session
    req.logout((err) => {
        if (err) return next(err);
        req.session.destroy(() => {
            // Redirect to FusionAuth to clear the SSO session
            const logoutUrl = `${FUSIONAUTH_URL}/oauth2/logout?client_id=${CLIENT_ID}` +
                `&post_logout_redirect_uri=${encodeURIComponent('http://localhost:3000/login')}`;
            res.redirect(logoutUrl);
        });
    });
});

app.get('/', ensureAuthenticated, (req, res) => {
    const TARGET_FILE = getUserFile(req.user.id);

    // Ensure the file exists so we don't crash
    if (!fs.existsSync(TARGET_FILE)) {
        fs.writeFileSync(TARGET_FILE, `Hello ${req.user.name}!`, 'utf8');
    }

    const content = fs.readFileSync(TARGET_FILE, 'utf8');

    // Simple HTML UI
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Text Editor</title>
            <style>
                body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
                textarea { width: 100%; height: 300px; padding: 10px; margin-bottom: 10px; }
                button { padding: 10px 20px; background: #007bff;
                         color: white; border: none; cursor: pointer; }
                button:hover { background: #0056b3; }
                .logout-btn { background: #dc3545; color: white; padding: 8px 15px;
                              text-decoration: none; border-radius: 4px; float: right; }
            </style>
        </head>
        <body>
            <a href="/logout" class="logout-btn">Logout</a>
            <p style="float: right; margin-right: 20px;">Welcome, ${req.user.name}</p>
            <h1>Personal Note Editor</h1>
            <form method="POST" action="/save">
                <textarea name="content">${content}</textarea>
                <br>
                <button type="submit">Save Changes</button>
            </form>
        </body>
        </html>
    `;
    res.send(html);
});

app.post('/save', ensureAuthenticated, (req, res) => {
    const TARGET_FILE = getUserFile(req.user.id);
    const newContent = req.body.content;
    fs.writeFileSync(TARGET_FILE, newContent, 'utf8');
    res.redirect('/'); // Refresh the page to show updated content
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
