use actix_web::{get, web, Error, HttpResponse, Responder};
use actix_session::{Session};
use std::env;
use oauth2::{
    AuthorizationCode,
    AuthUrl,
    ClientId,
    ClientSecret,
    CsrfToken,
    PkceCodeChallenge,
    PkceCodeVerifier,
    RedirectUrl,
    Scope,
    TokenResponse,
    TokenUrl
};
use oauth2::basic::BasicClient;
use oauth2::reqwest::async_http_client;
use reqwest;
use serde::Deserialize;

#[get("/logout")]
async fn logout(session: Session) -> impl Responder {
    let _ = session.remove("email");
    HttpResponse::Found().append_header(("Location", "/")).finish()
}

#[get("/login")]
async fn login(session: Session) -> impl Responder {
    let (pkce_challenge, pkce_verifier) = PkceCodeChallenge::new_random_sha256();
    let (auth_url, csrf_token) = get_oauth_client()
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("openid".to_string()))
        .add_scope(Scope::new("email".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .set_pkce_challenge(pkce_challenge)
        .url();
    let _ = session.insert("csrf_token", csrf_token);
    let _ = session.insert("pkce_verifier", pkce_verifier);
    HttpResponse::Found().append_header(("Location", auth_url.to_string())).finish()
}

#[get("/callback")]
async fn callback(params: web::Query<AuthCallbackParams>, session: Session) ->  Result<HttpResponse, Error> {
    // confirm pkce match
    let received_state = &params.state;
    if let Ok(saved_state) = session.get::<String>("csrf_token") {
        if saved_state != Some(received_state.clone()) {
            return Ok(HttpResponse::BadRequest().body("PKCE state mismatch"));
        }
    }
    else {
        return Ok(HttpResponse::InternalServerError().body("Session error"));
    }

    // get access token
    let pkce_verifier = session.get::<String>("pkce_verifier").unwrap().unwrap();
    let token_result = match get_oauth_client()
        .exchange_code(AuthorizationCode::new(params.code.clone()))
        .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
        .request_async(async_http_client)
        .await {
            Ok(result) => result,
            Err(e) => {
                println!("{:#?}", e);
                return Ok(HttpResponse::InternalServerError().body("Error during token exchange"));
            }
        };

    // get email
    let client = reqwest::Client::new();
    let user_info_response = match client
        .get(format!("{}/oauth2/userinfo", env::var("FUSIONAUTH_URL").expect("Missing FUSIONAUTH_URL")))
        .bearer_auth(token_result.access_token().secret())
        .send()
        .await {
            Ok(result) => result,
            Err(e) => {
                println!("{:#?}", e);
                return Ok(HttpResponse::InternalServerError().body("Error during get email"));
            }
        };
    if user_info_response.status().is_success() {
        let user_info = match user_info_response.json::<UserInfo>().await {
            Ok(result) => result,
            Err(e) => {
                println!("{:#?}", e);
                return Ok(HttpResponse::InternalServerError().body("Error during get email2"));
            }
        };
        let _ = session.insert("email", user_info.email.clone());
    }
    else {
        println!("{:#?}", user_info_response.error_for_status().unwrap_err());
        return Ok(HttpResponse::InternalServerError().body("Error during get email3"));
    }
    Ok(HttpResponse::Found().append_header(("Location", "/account")).finish())
}

fn get_oauth_client() -> BasicClient {
    BasicClient::new(
        ClientId::new(env::var("FUSIONAUTH_CLIENT_ID").expect("Missing FUSIONAUTH_CLIENT_ID")),
        Some(ClientSecret::new(env::var("FUSIONAUTH_CLIENT_SECRET").expect("Missing FUSIONAUTH_CLIENT_SECRET"))),
        AuthUrl::new(env::var("FUSIONAUTH_URL").expect("Missing FUSIONAUTH_URL") + "/oauth2/authorize").expect("Invalid AuthUrl"),
        Some(TokenUrl::new(env::var("FUSIONAUTH_URL").expect("Missing FUSIONAUTH_URL") + "/oauth2/token").expect("Invalid TokenUrl"))
    )
    .set_redirect_uri(RedirectUrl::new(env::var("FUSIONAUTH_REDIRECT_URL").expect("Missing FUSIONAUTH_REDIRECT_URL")).expect("Invalid RedirectUrl"))
}

#[derive(Deserialize)]
struct AuthCallbackParams {
    state: String,
    code: String,
}

#[derive(Deserialize)]
struct UserInfo {
    email: String,
}