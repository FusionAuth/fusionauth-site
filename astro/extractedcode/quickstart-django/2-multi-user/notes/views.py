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

# set up a directory for multi-user files
DATA_DIR = BASE_DIR / 'user_data'
DATA_DIR.mkdir(exist_ok=True)

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
    client_kwargs={'scope': 'openid profile email', 'code_challenge_method': 'S256'},
)


# require authentication to access
def login_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if 'user' not in request.session:
            return redirect('/login')
        return view(request, *args, **kwargs)
    return wrapped


# helper to get specific user file
def get_user_file(user_id):
    return DATA_DIR / f'note-{user_id}.txt'


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
    <p style="float: right; margin-right: 20px;">Welcome, {{ name }}</p>
    <h1>Personal Note Editor</h1>
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

    # authlib validates the ID token and decodes its claims into userinfo
    userinfo = token['userinfo']
    full_name = f"{userinfo.get('given_name', '')} {userinfo.get('family_name', '')}".strip()

    request.session['user'] = {
        'id': userinfo['sub'],
        'email': userinfo.get('email'),
        'name': full_name or userinfo.get('email') or 'User',
    }
    return redirect('/')


def logout(request):
    # Clear the local Django session
    request.session.flush()

    # Redirect to FusionAuth to clear the SSO session
    return redirect(f'{FUSIONAUTH_URL}/oauth2/logout?' + urlencode({
        'client_id': CLIENT_ID,
        'post_logout_redirect_uri': 'http://localhost:3000/login',
    }))


@login_required
def home(request):
    user = request.session['user']
    target_file = get_user_file(user['id'])

    # Ensure the file exists so we don't crash
    if not target_file.exists():
        target_file.write_text(f"Hello {user['name']}!")

    context = RequestContext(request, {'name': user['name'], 'content': target_file.read_text()})
    return HttpResponse(PAGE.render(context))


@login_required
def save(request):
    get_user_file(request.session['user']['id']).write_text(request.POST['content'])
    return redirect('/')  # Refresh the page to show updated content
