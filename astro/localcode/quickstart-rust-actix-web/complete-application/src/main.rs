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
    .bind(("0.0.0.0", 9012))?
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
    state.insert("isError", (!amount.chars().all(|c| c.is_digit(10) || c == '.')).to_string());

    // Work in whole cents. Doing this arithmetic in floating point loses a cent
    // for roughly a tenth of all amounts, because 0.29 * 100.0 is
    // 28.999999999999996 and flooring that gives 28.
    let total_cents = (total * 100.0).round().abs() as i64;
    state.insert("total", format!("{:.2}", total_cents as f64 / 100.0));

    let nickels = total_cents / 5;
    state.insert("nickels", format!("{}", nickels));

    let pennies = total_cents - nickels * 5;
    state.insert("pennies", format!("{}", pennies));
}
