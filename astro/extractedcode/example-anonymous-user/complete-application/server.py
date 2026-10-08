# :snippet-start: baseApplication
import json
import math
from os import environ as env
from urllib.parse import quote_plus, urlencode
from authlib.integrations.flask_client import OAuth
from authlib.jose import jwt as jwt_decoder
from dotenv import find_dotenv, load_dotenv
from flask import Flask, redirect, render_template, session, url_for, request, make_response
from fusionauth.fusionauth_client import FusionAuthClient
import random
import string
import urllib.request

ACCESS_TOKEN_COOKIE_NAME = "cb_access_token"
REFRESH_TOKEN_COOKIE_NAME = "cb_refresh_token"
USERINFO_COOKIE_NAME = "cb_userinfo"
ANON_JWT_COOKIE_NAME = "cb_anon_user"

ENV_FILE = find_dotenv()
if ENV_FILE:
  load_dotenv(ENV_FILE)

app = Flask(__name__)
app.secret_key = env.get("APP_SECRET_KEY")

oauth = OAuth(app)

oauth.register(
  "FusionAuth",
  client_id=env.get("CLIENT_ID"),
  client_secret=env.get("CLIENT_SECRET"),
  client_kwargs={
    "scope": "openid offline_access",
    'code_challenge_method': 'S256' # This enables PKCE
  },
  server_metadata_url=f'{env.get("ISSUER")}/.well-known/openid-configuration'
)

jwks_url=f'{env.get("ISSUER")}/.well-known/jwks.json'

# :snippet-start: createFusionAuthClient
client = FusionAuthClient(env.get("API_KEY"), 'http://localhost:9011')
# :snippet-end:

if __name__ == "__main__":
  app.run(host="0.0.0.0", port=env.get("PORT", 9012))

def get_logout_url():
  return env.get("ISSUER") + "/oauth2/logout?" + urlencode({"client_id": env.get("CLIENT_ID")},quote_via=quote_plus)
# :snippet-end:

# :snippet-start: homeRoute
@app.route("/")
def home():
  if request.cookies.get(ACCESS_TOKEN_COOKIE_NAME, None) is not None:
    # In a real application, we would validate the token signature and expiration
    return redirect("/account")

  return render_template("home.html")
# :snippet-end:

# :snippet-start: registerRoute
@app.route("/register", methods=['GET', 'POST'])
def register():
  message = {}
  # if they have no cookie, send them to the registration page 
  if request.cookies.get(ANON_JWT_COOKIE_NAME, None) is None:
    # redirect them to the normal registration page
    redirect_uri=url_for("callback", _external=True)
    authorize_url_obj = oauth.FusionAuth.create_authorization_url(
      redirect_uri=redirect_uri
    )
    authorize_url = authorize_url_obj['url']
    state = authorize_url_obj['state']

    # depends on the fact that register is always the same as authorize, except the last path param
    register_url = authorize_url.replace('/oauth2/authorize','/oauth2/register')

    # from https://github.com/lepture/authlib/blob/master/authlib/integrations/flask_client/apps.py#L36 just mimic what the redirect would have done
    oauth.FusionAuth.save_authorize_data(redirect_uri=redirect_uri, **authorize_url_obj)
    return redirect(register_url)
  else: 
# :snippet-start: registerAnonymousUserRoute
  # if they have a cookie, look up the user and convert them and send a password reset
    if request.method == 'POST':
      user_id = get_anon_user_id_from_cookie()
      if user_id is None:
        print("couldn't find user")
        message["message"] = "Couldn't find your user id."
        return render_template("register.html", message=message)
      
      # correct the email address using patch if the email doesn't already exist
      email_param = request.form["email"]
     
      user = client.retrieve_user_by_email(email_param).success_response
      message["message"] = "Please check your email to set your password."

      # if we already have the user in our system, fail silently. depending on your use case, you may want to sent the forgot password email, or display an error message
      if user is None:
        patch_data = {
          'user': {
            'email': email_param
          }
        }
        patch_response = client.patch_user(user_id, patch_data).success_response

        forgot_password_data = {
          'loginId': email_param,
          'state': { 'anon_user': 'true' }
        }
        trigger_email_response = client.forgot_password(forgot_password_data)

# :snippet-end:
      
    return render_template("register.html", message=message)
# :snippet-end:

# :snippet-start: cleanupAnonymousUserRoute
@app.route("/webhook", methods=['POST'])
def webhook():
  # look up the user by id. If they are not an anonymous user return 204 directly, otherwise update their anonymous user status to be false and return 204
  # looking for email user login event because email verified is only fired on explicit email verification
  if request.method == 'POST':
    webhookjson = request.json
    event_type = webhookjson['event']['type']
    is_anon_user = webhookjson['event']['user'] and webhookjson['event']['user']['data'] and webhookjson['event']['user']['data']['anonymousUser']
    if event_type == 'user.login.success' and is_anon_user:
      user_id = webhookjson['event']['user']['id']
      patch_data = {
        'user': {
          'username': '',
          'data' : {
            'anonymousUser':False
          }
        }
      }
      patch_response = client.patch_user(user_id, patch_data).success_response

  return '', 204
# :snippet-end:

# :snippet-start: videoRoute
# :snippet-start: createUser
@app.route("/video")
def video():
  if request.cookies.get(ANON_JWT_COOKIE_NAME, None) is None:
    # create an anonymous user, set view count to 1
    new_user={
      'user': {
        'username': random_string(64),
        'password': random_string(64),
        'data': {
          'watchCount':1,
          'anonymousUser':True
        }
      }
    }

    response = client.create_user(new_user).success_response
    user_id=response['user']['id']
# :snippet-end:
# :snippet-start: createJWT
    # create a JWT, good for a year
    jwt_ttl=60*60*24*365
    jwt={
      'claims': {
        'userId': user_id
      },
      'keyId': env.get("SIGNING_KEY_ID"),
      'timeToLiveInSeconds': jwt_ttl
    }
    response = client.vend_jwt(jwt).success_response
    token=response['token']
    resp = make_response(render_template("video.html"))

    # set the cookie
    resp.set_cookie(ANON_JWT_COOKIE_NAME, token, max_age=jwt_ttl, httponly=True, samesite="Lax")
# :snippet-end:
    return resp
  else:
# :snippet-start: readJWT
    user_id = get_anon_user_id_from_cookie()
    if user_id is None:
      print("couldn't find user")
      return render_template("video.html")

    # retrieve the user by id
    user = client.retrieve_user(user_id).success_response
    current_count = user['user']['data']['watchCount']
    new_count = current_count + 1
    # increment watchCount using patch
    patch_data = {
      'user': {
        'data': {
          'watchCount':new_count
        }
      }
    }
    patch_response = client.patch_user(user_id, patch_data).success_response
# :snippet-end:
    return render_template("video.html")
# :snippet-end:

# :snippet-start: loginRoute
@app.route("/login")
def login():
  return oauth.FusionAuth.authorize_redirect(
    redirect_uri=url_for("callback", _external=True)
  )
# :snippet-end:


# :snippet-start: callbackRoute
@app.route("/callback")
def callback():
  token = oauth.FusionAuth.authorize_access_token()

  resp = make_response(redirect("/"))

  resp.set_cookie(ACCESS_TOKEN_COOKIE_NAME, token["access_token"], max_age=token["expires_in"], httponly=True, samesite="Lax")
  resp.set_cookie(REFRESH_TOKEN_COOKIE_NAME, token["refresh_token"], max_age=token["expires_in"], httponly=True, samesite="Lax")
  resp.set_cookie(USERINFO_COOKIE_NAME, json.dumps(token["userinfo"]), max_age=token["expires_in"], httponly=False, samesite="Lax")

  # you've successfully logged in, so you must have a password, so we can delete your anon identifier
  resp.delete_cookie(ANON_JWT_COOKIE_NAME)
  session["user"] = token["userinfo"]

  return resp
# :snippet-end:


# :snippet-start: logoutRoute
@app.route("/logout")
def logout():
  session.clear()

  resp = make_response(redirect("/"))
  resp.delete_cookie(ACCESS_TOKEN_COOKIE_NAME)
  resp.delete_cookie(REFRESH_TOKEN_COOKIE_NAME)
  resp.delete_cookie(USERINFO_COOKIE_NAME)

  return resp
# :snippet-end:


#
# This is the logged in Account page.
#
# :snippet-start: accountRoute
@app.route("/account")
def account():
  access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME, None)
  refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME, None)

  if access_token is None:
    return redirect(get_logout_url())

  return render_template(
    "account.html",
    session=json.loads(request.cookies.get(USERINFO_COOKIE_NAME, None)),
    logoutUrl=get_logout_url())
# :snippet-end:


#
# Takes a dollar amount and converts it to change
#
# :snippet-start: makeChangeRoute
@app.route("/make-change", methods=['GET', 'POST'])
def make_change():
  access_token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME, None)
  refresh_token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME, None)

  if access_token is None:
    return redirect(get_logout_url())

  change = {
    "error": None
  }

  if request.method == 'POST':
    dollar_amt_param = request.form["amount"]

    try:
      if dollar_amt_param:
        dollar_amt = float(dollar_amt_param)

        nickels = int(dollar_amt / 0.05)
        pennies = math.ceil((dollar_amt - (0.05 * nickels)) / 0.01)

        change["total"] = format(dollar_amt, ",.2f")
        change["nickels"] = format(nickels, ",d")
        change["pennies"] = format(pennies, ",d")

    except ValueError:
      change["error"] = "Please enter a dollar amount"

  return render_template(
    "make-change.html",
    session=json.loads(request.cookies.get(USERINFO_COOKIE_NAME, None)),
    change=change,
    logoutUrl=get_logout_url())
# :snippet-end:

# from https://stackoverflow.com/questions/2257441/random-string-generation-with-upper-case-letters-and-digits
def random_string(length):
  return ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(length))

# :snippet-start: getAnonUserIdFromCookie
def get_anon_user_id_from_cookie():
  # get the cookie
  anon_jwt = request.cookies.get(ANON_JWT_COOKIE_NAME, None)
  jwks = ''
  with urllib.request.urlopen(jwks_url) as response:
    jwks = response.read().decode("utf-8") 
  try:
    claims = jwt_decoder.decode(anon_jwt, key=jwks)
  except ValueError:
    print("couldn't get claims")
    return None

  return claims['userId']
# :snippet-end:

