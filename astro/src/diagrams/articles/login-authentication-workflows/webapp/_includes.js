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
  Forums->>Browser: (HTML, CSS & JavaScript - with login link)
`;

export const forumsJWTCookieLoad = `
  Note over Browser,Hacker: Forums load
  Browser->>Forums: GET /posts<br/>[JWT HttpOnly w/ domain: store.example.com]
  Forums->>Browser: (Forum posts HTML)
`;

export const forumsJWTLocalStorageLoad = `
  Note over Browser,Hacker: Forums load
  Browser->>Forums: GET /api/load-load-posts<br/>(JWT from local storage)
  Forums->>Browser: (Forum posts)
`;

export const forumsRefreshJWTLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: GET /posts<br/>[Refresh token and JWT HttpOnly w/ domain: forums.example.com]
  Forums->>Browser: (Forum posts HTML)
`;

export const forumsSessionLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: GET /posts<br/>[SessionId HttpOnly w/ domain: forums.example.com]
  Forums->>Forums: Session extended
  Forums->>Browser: (Forum posts HTML)
`;

export const forumsSessionRefreshLoad = `
  Note over Browser,Hacker: Forum load
  Browser->>Forums: GET /posts<br/>[SessionId and Refresh token HttpOnly w/ domain: forums.example.com]
  Forums->>Forums: Session extended
  Forums->>Browser: (Forum posts HTML)
`;

export const initialize = `
  Note over Browser,Hacker: Initialize
  Browser->>Store: GET /
  Store->>Browser: (HTML, CSS & JavaScript - with login link)
`;

export const shoppingCartJWTCookieLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[JWT HttpOnly w/ domain: store.example.com]
  Store->>Browser: (Shopping cart HTML)
`;

export const shoppingCartJWTLocalStorageLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: AJAX GET /api/load-shopping-cart<br/>(JWT from local storage)
  Store->>Browser: (Shopping cart contents)
`;

export const shoppingCartRefreshJWTLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>Browser: (Shopping cart HTML)
`;

export const shoppingCartRefreshJWTRefresh = `
  ${jwtExpires}
  
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Browser: (Shopping cart HTML)<br/>[New JWT HttpOnly w/ domain: store.example.com]
`;

export const shoppingCartRefreshJWTRelogin = `
  ${refreshTokenExpires}
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: GET /shopping-cart<br/>[Refresh token and JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: 404 Missing
  Store->>Browser: 302 Location: /login
  Browser->>Browser: Login same as above
`;

export const shoppingCartSessionLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Browser: (Shopping cart HTML)
`;

export const shoppingCartSessionRefreshLoad = `
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Browser: (Shopping cart HTML)
`;

export const shoppingCartSessionRefreshRefresh = `
  note over Browser, Browser: Session expires<br/>Refresh token still valid
  
  Note over Browser,Hacker: Shopping cart load
  Browser->>Store: GET /shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Store: Create new session and store User in it
  Store->>Browser: (Shopping cart contents)<br/>[New SessionId HttpOnly w/ domain: store.example.com]
`;

export const shoppingCartSessionRefreshRelogin = `
  note over Browser: Session expires<br/>Refresh token expires
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: GET /shopping-cart<br/>[SessionId and Refresh token HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: 404 Missing
  Store->>Browser: 302 Location: /login
  Browser->>Browser: Login same as above
`;

export const shoppingCartSessionRelogin = `
  ${sessionExpires}
  
  Note over Browser,Hacker: Re-login
  Browser->>Store: GET /shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Browser: 302 Location: /login
  Browser->>Browser: Login same as above
`;

export const stolenJWTRefreshJWT = `
  Note over Browser,Hacker: Stolen JWT
  Hacker->>Store: GET /shopping-cart<br/>[JWT HttpOnly w/ domain: store.example.com]
  Store->>Hacker: (Shopping cart HTML)
`;

export const stolenRefreshTokenRefreshJWT = `
  Note over Browser,Hacker: Stolen refresh token
  Hacker->>Store: GET /shopping-cart<br/>[Refresh token and bad JWT HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Hacker: (Shopping cart HTML)<br/>[New JWT HttpOnly w/ domain: store.example.com]
`;

export const stolenSessionId = `
  Note over Browser,Hacker: Stolen session id
  Hacker->>Store: GET /shopping-cart<br/>[SessionId HttpOnly w/ domain: store.example.com]
  Store->>Store: Session extended
  Store->>Hacker: (Shopping cart HTML)
`;

export const stolenSessionRefreshToken = `
  Note over Browser,Hacker: Stolen refresh token
  Hacker->>Store: GET /shopping-cart<br/>[Refresh token and bad session id HttpOnly w/ domain: store.example.com]
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Store: Create session and store User in
  Store->>Hacker: (Shopping cart HTML)<br/>[New JWT HttpOnly w/ domain: store.example.com]
`;
