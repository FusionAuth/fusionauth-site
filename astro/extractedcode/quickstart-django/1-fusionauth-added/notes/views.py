import os
from functools import wraps
from pathlib import Path
from urllib.parse import urlencode

from django.shortcuts import redirect
from django.template import RequestContext, Template
from django.http import HttpResponse

# auth dependencies
from authlib.integrations.django_client import OAuth
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
TARGET_FILE = BASE_DIR / 'note.txt'

# Ensure the file exists so we don't crash
if not TARGET_FILE.exists():
    TARGET_FILE.write_text('Hello! Edit this text.')

# read configuration from .env file
load_dotenv(BASE_DIR / '.env')
FUSIONAUTH_URL = 'http://localhost:9011'
CLIENT_ID = os.environ['FUSIONAUTH_CLIENT_ID']
CLIENT_SECRET = os.environ['FUSIONAUTH_CLIENT_SECRET']
CALLBACK_URL = os.environ['FUSIONAUTH_CALLBACK_URL']

# tell authlib how to talk to fusionauth
oauth = OAuth()
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
    def wrapped(request, *args, **kwargs):
        if 'user' not in request.session:
            return redirect('/login')
        return view(request, *args, **kwargs)
    return wrapped


# Simple HTML UI
PAGE = Template('''
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
    <a href="/logout" class="logout-btn">Logout</a>
    <h1>Edit: {{ filename }}</h1>
    <form method="POST" action="/save">
        {% csrf_token %}
        <textarea name="content">{{ content }}</textarea>
        <br>
        <button type="submit">Save Changes</button>
    </form>
</body>
</html>
''')


# --- routes ---
def login(request):
    return oauth.fusionauth.authorize_redirect(request, CALLBACK_URL)


def oauth_callback(request):
    token = oauth.fusionauth.authorize_access_token(request)
    request.session['user'] = {'id': token['userinfo']['sub']}
    return redirect('/')


def logout(request):
    # Clear the local Django session
    request.session.flush()

    # Redirect to FusionAuth to clear the SSO session
    return redirect(f'{FUSIONAUTH_URL}/oauth2/logout?' + urlencode({'client_id': CLIENT_ID}))


@login_required
def home(request):
    context = RequestContext(request, {'filename': TARGET_FILE.name, 'content': TARGET_FILE.read_text()})
    return HttpResponse(PAGE.render(context))


@login_required
def save(request):
    TARGET_FILE.write_text(request.POST['content'])
    return redirect('/')  # Refresh the page to show updated content
