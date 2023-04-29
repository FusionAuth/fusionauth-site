
export const participants = `
  participant Browser
  participant Store
  participant Forums
  participant FusionAuth
  participant Hacker
`;

export const jwtExpires = `
  Note over Browser: JWT expires
`;

export const refreshTokenExpires = `
  Note over Browser: Refresh token expires
`;

export const sessionExpires = `
  Note over Browser: Session expires
`;

export const attackVectors = `
  Note over Browser,Hacker: Attack vectors
`;

export const sso = `
  Note over Browser,Hacker: SSO login to forums
`;

export const ssoNotProvided = `
  Note over Browser,Hacker: SSO login to forums - not provided by FusionAuth for this workflow
`;

export const forumsInitialize = `
  Note over Browser,Hacker: Initialize
  Browser->>Forums: GET /<br/>[No cookies]
  Forums->>Browser: (SPA HTML, CSS & JavaScript)
  Browser->>Forums: GET /api/user<br/>[No cookies]
  Forums->>Browser: 404 Missing
`;

export const forumsInitializeLocalStorage = `
  Note over Browser,Hacker: Initialize
  Browser->>Forums: GET /<br/>[No cookies]
  Forums->>Browser: (SPA HTML, CSS & JavaScript)
  Browser->>Browser: Check local storage for JWT
`;

export const forumsJWTLocalStorageLoad = `
  Note over Browser,Hacker: Forums load
  Browser->>Forums: AJAX GET /api/load-load-posts<br/>(JWT from local storage)
  Forums->>Browser: (Forum posts)
`;

export const forumsJWTCookieLoad = `
  Note over Browser,Hacker: Forums load
  Browser->>Forums: AJAX GET /api/load-load-posts<br/>[JWT HttpOnly w/ domain: forums.example.com]
  Forums->>Browser: (Forum posts)
`;

export const forumsRefreshJWTLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: AJAX GET /api/load-posts<br/>[Refresh token and JWT HttpOnly w/ domain: forums.example.com]
  Forums->>Browser: (Forum posts)
`;

export const forumsSessionLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: AJAX GET /api/load-posts<br/>[SessionId HttpOnly w/ domain: forums.example.com]
  Forums->>Forums: Session extended
  Forums->>Browser: (Forum posts)
`;

export const forumsSessionRefreshLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: AJAX GET /api/load-posts<br/>[SessionId and Refresh token HttpOnly w/ domain: forums.example.com]
  Forums->>Forums: Session extended
  Forums->>Browser: (Forum posts)
`;

export const initialize = `
  Note over Browser,Hacker: Initialize
  autonumber
  Browser->>Store: GET /
  Store->>Browser: (SPA HTML, CSS & JavaScript)
  Browser->>Store: AJAX GET /api/user<br/>[No cookies]
  Store->>Browser: 404 Missing
`;

export const initializeLocalStorage = `
  Note over Browser,Hacker: Initialize
  Browser->>Store: GET /
  Store->>Browser: (SPA HTML, CSS & JavaScript)
  Browser->>Browser: Check local storage for JWT
`;

export const shoppingCartJWTLocalStorageLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>(JWT from local storage)
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartJWTCookieLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[JWT HttpOnly w/ domain: store.example.com]
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartRefreshJWTLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartRefreshJWTRefresh = `
  ${jwtExpires}
  
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Browser: (Shopping cart contents)<br/>[New JWT HttpOnly w/ domain: store.example.com]
`;

export const shoppingCartRefreshJWTRelogin = `
  ${refreshTokenExpires}
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: 404 Missing
  Store->>Browser: 401 Not Authorized
  Browser->>Browser: Login same as above
`;

export const shoppingCartSessionLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartSessionRefreshLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartSessionRefreshRefresh = `
  Note over Browser: Session expires<br/>Refresh token still valid
  
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Store: Create new session
  Store->>Browser: (Shopping cart contents)<br/>[New SessionId HttpOnly w/ domain: store.example.com]
`;

export const shoppingCartSessionRefreshRelogin = `
  Note over Browser: Session expires<br/>Refresh token expires
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: 404 Missing
  Store->>Browser: 401 Not Authorized
  Browser->>Browser: Login same as above
`;

export const shoppingCartSessionRelogin = `
  ${sessionExpires}
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Browser: 401 Not Authorized
  Browser->>Browser: Login same as above
`;

export const stolenJWTRefreshJWT = `
  Note over Browser,Hacker: Stolen JWT
  Hacker->>Store: GET /api/load-shopping-cart<br/>[JWT HttpOnly w/ domain: store.example.com]
  Store->>Hacker: (Shopping cart contents)
`;

export const stolenRefreshTokenRefreshJWT = `
  Note over Browser,Hacker: Stolen refresh token
  Hacker->>Store: GET /api/load-shopping-cart<br/>[Refresh token and bad JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Hacker: (Shopping cart contents)<br/>[New JWT HttpOnly w/ domain: store.example.com]
`;

export const stolenSessionId = `
  Note over Browser,Hacker: Stolen session id
  Hacker->>Store: GET /api/load-shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Hacker: (Shopping cart contents)
`;

export const stolenSessionRefreshToken = `
  Note over Browser,Hacker: Stolen refresh token
  Hacker->>Store: GET /shopping-cart<br/>[Refresh token and bad session id HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Store: Create session and store User in
  Store->>Hacker: (Shopping cart contents)<br/>[New session id HttpOnly w/ domain: store.example.com]
`;
