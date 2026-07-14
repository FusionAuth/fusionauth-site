import os
from pathlib import Path
from dotenv import find_dotenv, load_dotenv

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ['APP_SECRET_KEY']
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app',
    'mozilla_django_oidc',
]

AUTHENTICATION_BACKENDS = ('mozilla_django_oidc.auth.OIDCAuthenticationBackend',)

OIDC_RP_CLIENT_ID = os.environ['CLIENT_ID']
OIDC_RP_CLIENT_SECRET = os.environ['CLIENT_SECRET']
OIDC_OP_AUTHORIZATION_ENDPOINT = os.environ['ISSUER'] + "/oauth2/authorize"
OIDC_OP_TOKEN_ENDPOINT = os.environ['ISSUER'] + "/oauth2/token"
OIDC_OP_USER_ENDPOINT = os.environ['ISSUER'] + "/oauth2/userinfo"
OIDC_RP_SCOPES = "openid profile email"
OIDC_RP_SIGN_ALGO = "RS256"
OIDC_OP_JWKS_ENDPOINT = os.environ['ISSUER'] + "/.well-known/jwks.json"
LOGIN_REDIRECT_URL = "http://localhost:8000/app/account/"
LOGOUT_REDIRECT_URL = os.environ['ISSUER'] + "/oauth2/logout?client_id=" + OIDC_RP_CLIENT_ID

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': (os.path.join(BASE_DIR, 'app/templates'),),
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mysite.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
