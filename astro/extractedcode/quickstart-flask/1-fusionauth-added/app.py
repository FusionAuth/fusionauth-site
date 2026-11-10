import os
from functools import wraps
from pathlib import Path
from urllib.parse import urlencode

from flask import Flask, redirect, render_template_string, request, session

# auth dependencies
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv

app = Flask(__name__)
PORT = 3000
TARGET_FILE = Path(__file__).parent / 'note.txt'

# read configuration from .env file
load_dotenv()
FUSIONAUTH_URL = 'http://localhost:9011'
CLIENT_ID = os.environ['FUSIONAUTH_CLIENT_ID']
CLIENT_SECRET = os.environ['FUSIONAUTH_CLIENT_SECRET']
CALLBACK_URL = os.environ['FUSIONAUTH_CALLBACK_URL']
app.secret_key = os.environ['SESSION_SECRET']

# tell authlib how to talk to fusionauth
oauth = OAuth(app)
oauth.register(
    'fusionauth',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url=f'{FUSIONAUTH_URL}/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid', 'code_challenge_method': 'S256'},
)


# require authentication to access
def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if 'user' not in session:
            return redirect('/login')
        return view(*args, **kwargs)
    return wrapped


# Ensure the file exists so we don't crash
if not TARGET_FILE.exists():
    TARGET_FILE.write_text('Hello! Edit this text.')

# Simple HTML UI
PAGE = '''
<!DOCTYPE html>
<html>
<head>
    <title>Text Editor</title>
    <style>
        body { font-family: sans-serif; margin: 40px; line-height: 1.6; }
        textarea { width: 100%; height: 300px; padding: 10px; margin-bottom: 10px; }
        button { padding: 10px 20px; background: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background: #0056b3; }
        .logout-btn { background: #dc3545; color: white; padding: 8px 15px;
                      text-decoration: none; border-radius: 4px; float: right; }
    </style>
</head>
<body>
    <h1>Edit: {{ filename }}</h1>
    <form method="POST" action="/save">
        <textarea name="content">{{ content }}</textarea>
        <br>
        <button type="submit">Save Changes</button>
        <a href="/logout" class="logout-btn">Logout</a>
    </form>
</body>
</html>
'''


# --- Routes ---
@app.get('/login')
def login():
    return oauth.fusionauth.authorize_redirect(CALLBACK_URL)


@app.get('/oauth-callback')
def oauth_callback():
    token = oauth.fusionauth.authorize_access_token()
    # remember the user in the session cookie
    session['user'] = {'id': token['userinfo']['sub']}
    return redirect('/')


@app.get('/logout')
def logout():
    # Clear the local Flask session
    session.clear()

    # Redirect to FusionAuth to clear the SSO session
    # This ensures the user is actually logged out of the identity provider
    return redirect(f'{FUSIONAUTH_URL}/oauth2/logout?' + urlencode({'client_id': CLIENT_ID}))


@app.get('/')
@login_required
def home():
    return render_template_string(PAGE, filename=TARGET_FILE.name, content=TARGET_FILE.read_text())


@app.post('/save')
@login_required
def save():
    TARGET_FILE.write_text(request.form['content'])
    return redirect('/')  # Refresh the page to show updated content


if __name__ == '__main__':
    app.run(port=PORT)
