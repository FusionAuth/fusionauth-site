package main

// :snippet-start: imports
import (
  "fmt"
  "html/template"
  "math"
  "net/http"
  "net/url"
  "path"
  "strconv"

  "github.com/coreos/go-oidc/v3/oidc"
  "github.com/thanhpk/randstr"
  "golang.org/x/oauth2"
)
// :snippet-end:

type AccountVars struct {
  LogoutUrl string
  Email     string
}

type MakeChangeVars struct {
  LogoutUrl string
  Email     string
  Error     string
  Total     string
  Nickels   int
  Pennies   int
}

// :snippet-start: constants
const (
  FusionAuthHost         string = "http://localhost:9011"
  FusionAuthTenantID     string = "d7d09513-a3f5-401c-9685-34ab6c552453"
  FusionAuthClientID     string = "e9fdb985-9173-4e01-9d73-ac2d60d1dc8e"
  FusionAuthClientSecret string = "2HYT86lWSAntc-mvtHLX5XXEpk9ThcqZb4YEh65CLjA-not-for-prod"
  AccessTokenCookieName  string = "cb_access_token"
  RefreshTokenCookieName string = "cb_refresh_token"
  IDTokenCookieName      string = "cb_id_token"
)
// :snippet-end:

// :snippet-start: oidcClient
var (
  oidcProvider     *oidc.Provider
  fusionAuthConfig *oauth2.Config

  // In a production application, persist a unique state string per login request
  oauthStateString string = randstr.Hex(16)
)

func init() {
  provider, err := oidc.NewProvider(oauth2.NoContext, FusionAuthHost)

  if err != nil {
    fmt.Println("Error creating OIDC provider: " + err.Error())
  } else {
    oidcProvider = provider

    fusionAuthConfig = &oauth2.Config{
      ClientID:     FusionAuthClientID,
      ClientSecret: FusionAuthClientSecret,
      RedirectURL:  "http://localhost:8080/callback",
      Endpoint:     oidcProvider.Endpoint(),
      Scopes:       []string{oidc.ScopeOpenID, "email", "offline_access"},
    }
  }
}
// :snippet-end:

func main() {
  http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
  http.HandleFunc("/", handleMain)
  http.HandleFunc("/login", handleLoginRequest)
  http.HandleFunc("/callback", handleFusionAuthCallback)
  http.HandleFunc("/account", handleAccount)
  http.HandleFunc("/make-change", handleMakeChange)
  http.HandleFunc("/logout", handleLogout)

  port := "8080"

  fmt.Println("Starting HTTP server at http://localhost:" + port)
  fmt.Println(http.ListenAndServe(":"+port, nil))
}

// :snippet-start: homeRoute
func handleMain(w http.ResponseWriter, r *http.Request) {
  // See if the user is authenticated. In a real application, validate the token signature and expiration.
  _, err := r.Cookie(AccessTokenCookieName)

  if err != nil {
    WriteWebPage(w, "home.html", nil)
    return
  }

  // The user is authenticated, redirect to /account.
  http.Redirect(w, r, "/account", http.StatusFound)
  return
}
// :snippet-end:

// :snippet-start: loginRoute
func handleLoginRequest(w http.ResponseWriter, r *http.Request) {
  http.Redirect(w, r, fusionAuthConfig.AuthCodeURL(oauthStateString), http.StatusFound)
}
// :snippet-end:

// :snippet-start: callbackRoute
func handleFusionAuthCallback(w http.ResponseWriter, r *http.Request) {

  // Validate the state value to make sure this came from us
  if r.FormValue("state") != oauthStateString {
    http.Error(w, "Bad request - incorrect state value", http.StatusBadRequest)
    return
  }

  // Exchange the authorization code for access, refresh, and id tokens
  token, err := fusionAuthConfig.Exchange(oauth2.NoContext, r.FormValue("code"))

  if err != nil {
    http.Error(w, "Error getting access token: "+err.Error(), http.StatusInternalServerError)
    return
  }

  rawIDToken, ok := token.Extra("id_token").(string)

  if !ok {
    http.Error(w, "No ID token found in request to /callback", http.StatusBadRequest)
    return
  }

  // Write access, refresh, and id tokens to http-only cookies
  WriteCookie(w, AccessTokenCookieName, token.AccessToken, 3600, true)
  WriteCookie(w, RefreshTokenCookieName, token.RefreshToken, 3600, true)
  WriteCookie(w, IDTokenCookieName, rawIDToken, 3600, false)

  http.Redirect(w, r, "/account", http.StatusFound)
}
// :snippet-end:

// :snippet-start: accountRoute
func getLogoutUrl() string {
  return fmt.Sprintf("%s/oauth2/logout?client_id=%s&tenantId=%s",
    FusionAuthHost, url.QueryEscape(FusionAuthClientID), url.QueryEscape(FusionAuthTenantID))
}

func handleAccount(w http.ResponseWriter, r *http.Request) {

  // Make sure the user is authenticated. In a production application, validate the token
  // signature, check expiration, and attempt to refresh if expired.
  cookie, err := r.Cookie(AccessTokenCookieName)

  if err != nil || cookie == nil {
    http.Redirect(w, r, "/", http.StatusFound)
    return
  }

  // Get the ID token to display the user's email address
  cookie, err = r.Cookie(IDTokenCookieName)

  if err != nil || cookie == nil {
    http.Error(w, "No ID token found", http.StatusBadRequest)
    return
  }

  verifier := oidcProvider.Verifier(&oidc.Config{ClientID: FusionAuthClientID})

  idToken, err := verifier.Verify(oauth2.NoContext, cookie.Value)

  if err != nil {
    http.Error(w, "Error verifying ID token: "+err.Error(), http.StatusBadRequest)
    return
  }

  // Extract the email claim
  var claims struct {
    Email string `json:"email"`
  }

  if err := idToken.Claims(&claims); err != nil {
    http.Error(w, "Error reading claims from ID token: "+err.Error(), http.StatusInternalServerError)
    return
  }

  WriteWebPage(w, "account.html", AccountVars{LogoutUrl: getLogoutUrl(), Email: claims.Email})
}
// :snippet-end:

func handleMakeChange(w http.ResponseWriter, r *http.Request) {
  cookie, err := r.Cookie(AccessTokenCookieName)

  if err != nil || cookie == nil {
    http.Redirect(w, r, "/", http.StatusFound)
    return
  }

  cookie, err = r.Cookie(IDTokenCookieName)

  if err != nil || cookie == nil {
    http.Error(w, "No ID token found", http.StatusBadRequest)
    return
  }

  verifier := oidcProvider.Verifier(&oidc.Config{ClientID: FusionAuthClientID})

  idToken, err := verifier.Verify(oauth2.NoContext, cookie.Value)

  if err != nil {
    http.Error(w, "Error verifying ID token: "+err.Error(), http.StatusBadRequest)
    return
  }

  var claims struct {
    Email string `json:"email"`
  }

  if err := idToken.Claims(&claims); err != nil {
    http.Error(w, "Error reading claims from ID token: "+err.Error(), http.StatusInternalServerError)
    return
  }

  vars := MakeChangeVars{LogoutUrl: getLogoutUrl(), Email: claims.Email}

  if r.Method == http.MethodPost {
    amountStr := r.FormValue("amount")
    amount, err := strconv.ParseFloat(amountStr, 64)
    if err != nil || amount < 0 {
      vars.Error = "Please enter a valid dollar amount"
    } else {
      total := math.Floor(amount*100) / 100
      nickels := int(math.Floor(total / 0.05))
      pennies := int(math.Round((total - float64(nickels)*0.05) / 0.01))
      vars.Total = fmt.Sprintf("%.2f", total)
      vars.Nickels = nickels
      vars.Pennies = pennies
    }
  }

  WriteWebPage(w, "make-change.html", vars)
}

// :snippet-start: logoutRoute
func handleLogout(w http.ResponseWriter, r *http.Request) {
  // Delete the cookies we set
  WriteCookie(w, AccessTokenCookieName, "", -1, true)
  WriteCookie(w, RefreshTokenCookieName, "", -1, true)
  WriteCookie(w, IDTokenCookieName, "", -1, false)

  http.Redirect(w, r, "/", http.StatusFound)
}
// :snippet-end:

func WriteWebPage(w http.ResponseWriter, tmpl string, vars interface{}) {
  fn := path.Join("templates", tmpl)
  parsedTmpl, err := template.ParseFiles(fn)

  if err != nil {
    http.Error(w, "Error reading template file "+tmpl+": "+err.Error(), http.StatusInternalServerError)
    return
  }

  if err := parsedTmpl.Execute(w, vars); err != nil {
    http.Error(w, err.Error(), http.StatusInternalServerError)
  }
}

func WriteCookie(w http.ResponseWriter, name string, value string, maxAge int, httpOnly bool) {
  cookie := http.Cookie{
    Name:     name,
    Domain:   "localhost",
    Value:    value,
    Path:     "/",
    MaxAge:   maxAge,
    HttpOnly: httpOnly,
    SameSite: http.SameSiteLaxMode,
  }
  http.SetCookie(w, &cookie)
}
