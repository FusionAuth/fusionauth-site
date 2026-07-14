use actix_web::{get, post, web, App, HttpResponse, HttpServer}; // web server
use actix_files as fs; // static image files
use actix_session::{Session, SessionMiddleware, storage::CookieSessionStore, config::CookieContentSecurity}; // store auth info in browser cookies
use actix_web::cookie::{Key, SameSite};
use handlebars::Handlebars; // html templates
use std::collections::HashMap; // pass data to templates
use dotenv::dotenv; // load .env file
mod auth;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let handlebars_ref = setup_handlebars().await;
    let key = Key::generate();
    HttpServer::new(move || {
        App::new()
            .wrap(SessionMiddleware::builder(CookieSessionStore::default(), key.clone())
                    .cookie_content_security(CookieContentSecurity::Private)
                    .cookie_same_site(SameSite::Lax)
                    .build())
            .service(account)
            .service(change_get)
            .service(change_post)
            .service(index)
            .service(auth::login)
            .service(auth::logout)
            .service(auth::callback)
            .service(fs::Files::new("/static", "static").show_files_listing())
            .app_data(handlebars_ref.clone())
    })
    .bind(("127.0.0.1", 9012))?
    .run()
    .await
}

async fn setup_handlebars() -> web::Data<Handlebars<'static>> {
    let mut handlebars = Handlebars::new();
    handlebars
        .register_templates_directory(".html", "./templates")
        .unwrap();
    web::Data::new(handlebars)
}

#[get("/")]
async fn index(hb: web::Data<Handlebars<'_>>, session: Session) -> HttpResponse {
    if let Ok(Some(_)) = session.get::<String>("email") {
        return HttpResponse::Found().append_header(("Location", "/account")).finish();
    }
    let body = hb.render("index", &{}).unwrap();
    HttpResponse::Ok().body(body)
}

#[get("/account")]
async fn account(hb: web::Data<Handlebars<'_>>, session: Session) -> HttpResponse {
    if let Ok(None) | Err(_) = session.get::<String>("email") {
        return HttpResponse::Found().append_header(("Location", "/")).finish();
    }
    let mut data = HashMap::new();
    data.insert("email", session.get::<String>("email").unwrap());
    let body = hb.render("account", &data).unwrap();
    HttpResponse::Ok().body(body)
}

#[get("/change")]
async fn change_get(hb: web::Data<Handlebars<'_>>, session: Session) -> HttpResponse {
    if let Ok(None) | Err(_) = session.get::<String>("email") {
        return HttpResponse::Found().append_header(("Location", "/")).finish();
    }
    let mut data = HashMap::<&str, String>::new();
    data.insert("email", session.get::<String>("email").unwrap().unwrap());
    data.insert("isGetRequest", "true".to_string());
    let body = hb.render("change", &data).unwrap();
    HttpResponse::Ok().body(body)
}

#[post("/change")]
async fn change_post(hb: web::Data<Handlebars<'_>>, session: Session, form: web::Form<HashMap<String, String>>) -> HttpResponse {
    if let Ok(None) | Err(_) = session.get::<String>("email") {
        return HttpResponse::Found().append_header(("Location", "/")).finish();
    }
    let mut data = HashMap::<&str, String>::new();
    data.insert("email", session.get::<String>("email").unwrap().unwrap());
    data.insert("isGetRequest", "false".to_string());
    if let Some(amount) = form.get("amount") {
        calculate_change(amount, &mut data);
    }
    else {
        data.insert("isError", "true".to_string());
    }
    let body = hb.render("change", &data).unwrap();
    HttpResponse::Ok().body(body)
}

fn calculate_change(amount: &str, state: &mut HashMap::<&str, String>) -> () {
    let total = match amount.parse::<f64>() {
        Ok(t) => t,
        Err(_) => {
            state.insert("isError", "true".to_string());
            return;
        }
    };
    let rounded_total = (total * 100.0).floor() / 100.0;

    state.insert("isError", (!amount.chars().all(|c| c.is_digit(10) || c == '.')).to_string());
    state.insert("total", format!("{:.2}", rounded_total));

    let nickels = (rounded_total / 0.05).floor().abs();
    state.insert("nickels", format!("{}", nickels));

    let pennies = ((rounded_total - (0.05 * nickels)) / 0.01).round().abs();
    state.insert("pennies", format!("{}", pennies));
}