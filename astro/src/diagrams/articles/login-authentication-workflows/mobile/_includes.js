export const initialize = `
  Note over Mobile,Hacker: Initialize
  Mobile->>Mobile: Open app and render login form
`;

export const participants = `
  participant Mobile
  participant Store
  participant FusionAuth
  participant Hacker
`;

export const mobileJWTExpire = `
  Note over Mobile: JWT expires
`;

export const mobileRefreshExpire = `
  Note over Mobile: Refresh token expires
`;

export const mobileAttack = `
  Note over Mobile,Hacker: Attack vectors
`;

export const shoppingCartLoad = `
  Note over Mobile,Hacker: Shopping cart load
  Mobile->>Store: GET /api/load-shopping-cart<br/>(Refresh token and JWT)
  Store->>Mobile: (Shopping cart contents)
`;

export const shoppingCartRefresh = `
  ${mobileJWTExpire}

  Note over Mobile,Hacker: Shopping cart load
  Mobile->>Store: GET /api/load-shopping-cart<br/>(Refresh token and JWT)
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Mobile: (Shopping cart contents and new JWT)
`;

export const shoppingCartRelogin = `
  ${mobileRefreshExpire}

  Note over Mobile,Hacker: Re-login
  Mobile->>Store: GET /api/load-shopping-cart<br/>(Refresh token and JWT)
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: 404 Missing
  Store->>Mobile: 401 Not Authorized
  Mobile->>Mobile: Login same as above
`;

export const stolenJWT = `
  Note over Mobile,Hacker: Stolen JWT
  Hacker->>Store: GET /api/load-shopping-cart<br/>(JWT)
  Store->>Hacker: (Shopping cart contents)
`;

export const stolenRefresh = `
  Note over Mobile,Hacker: Stolen refresh token
  Hacker->>Store: GET /api/load-shopping-cart<br/>(Refresh token and JWT)
  Store->>FusionAuth: POST /oauth2/token or POST /api/jwt/refresh<br/>(grant_type=refresh and refresh token)
  FusionAuth->>Store: (JWT)
  Store->>Hacker: (Shopping cart contents and new JWT)
`;