import {type AccessToken, FusionAuthClient} from '@fusionauth/typescript-client';
import {type Request, type Response} from 'express';
import pkceChallenge from 'pkce-challenge';
import * as crypto from 'crypto';
import * as jose from 'jose';
import type {JWTPayload} from "jose";

interface FusionAuthSDKConfiguration {
  accessTokenCookieName: string;
  apiKey: string;
  applicationId: string;
  baseURL: string;
  clientId: string;
  clientSecret: string;
  enablePKCE: boolean;
  enableRefreshTokens: boolean;
  idTokenCookieName: string;
  oauthIssuer: string;
  oauthPKCECookieName: string;
  oauthStateCookieName: string;
  port?: number;
  refreshTokenCookieName: string;
  scope: string;
}

const DefaultConfiguration: FusionAuthSDKConfiguration = {
  accessTokenCookieName: 'at',
  apiKey: '',
  applicationId: '',
  baseURL: '',
  clientId: '',
  clientSecret: '',
  enablePKCE: false,
  enableRefreshTokens: true,
  idTokenCookieName: 'id',
  oauthIssuer: 'acme.com',
  oauthPKCECookieName: 'op',
  oauthStateCookieName: 'os',
  port: 8080,
  refreshTokenCookieName: 'rt',
  scope: 'profile email openid offline_access',
};

export class FusionAuthSDK {
  private client: FusionAuthClient;
  private configuration: FusionAuthSDKConfiguration;
  private readonly JWKS: any;

  constructor(configuration: any) {
    this.client = new FusionAuthClient(configuration.apiKey, configuration.baseURL);
    this.configuration = {...DefaultConfiguration, ...configuration}; // Merge
    this.JWKS = jose.createRemoteJWKSet(new URL(`${this.configuration.baseURL}/.well-known/jwks.json`));
  }

  // :snippet-start: handleOAuthLogoutRedirect
  handleOAuthLogoutRedirect(res: Response) {
    res.clearCookie(this.configuration.accessTokenCookieName);
    res.clearCookie(this.configuration.idTokenCookieName);
    res.clearCookie(this.configuration.oauthPKCECookieName);
    res.clearCookie(this.configuration.oauthStateCookieName);
    res.clearCookie(this.configuration.refreshTokenCookieName);
  }
  // :snippet-end:

  /**
   * Locates the user's access token if one exists. This requires a user to be logged in, otherwise null is returned.
   *
   * @param req The request used to fetch the user cookies from.
   * @param res The response used to store updated user cookie values if needed.
   * @returns The user's information if one exists, null otherwise.
   */
  // :snippet-start: getUser
  async getUser(req: Request, res: Response): Promise<JWTPayload> {
    let accessToken = req.cookies[this.configuration.accessTokenCookieName];
    if (!accessToken) {
      return null;
    }

    let payload: JWTPayload;
    try {
      payload = (await jose.jwtVerify(accessToken, this.JWKS, {
        issuer: this.configuration.oauthIssuer,
        audience: this.configuration.applicationId,
      })).payload;
    } catch (e) {
      payload = await this.handleJWTException(req, res, e);
    }

    return payload;
  }
  // :snippet-end:

  async handleOAuthRedirect(req: Request): Promise<AccessToken | null> {
    try {
      // Ensure the OAuth redirect returned a code and state and the cookie exists
      const oauthStateCookie = req.cookies[this.configuration.oauthStateCookieName];
      if (!req.query?.code || !req.query?.state || !oauthStateCookie) {
        console.error('No code/state returned from OAuth redirect or the state cookie is missing.');
        return null;
      }

      // Capture query params
      const stateFromFusionAuth = req.query.state.toString();
      const authCode = req.query.code.toString();

      // Validate cookie state matches FusionAuth's returned state
      if (stateFromFusionAuth !== oauthStateCookie) {
        console.error("State doesn't match. uh-oh.");
        console.error(`Saw: ${stateFromFusionAuth} but expected: ${oauthStateCookie}`);
        return null;
      }

      // Exchange Auth Code and Verifier for Access Token
      let accessTokenResponse;
      if (this.configuration.enablePKCE) {
        const oauthPKCECookie = req.cookies[this.configuration.oauthPKCECookieName];
        if (!oauthPKCECookie?.verifier) {
          console.error('No PKCE verifier cookie found. This should not happen.');
          return null;
        }

        accessTokenResponse = await this.client.exchangeOAuthCodeForAccessTokenUsingPKCE(
            authCode,
            this.configuration.clientId,
            this.configuration.clientSecret,
            this.getRedirectURI(),
            oauthPKCECookie.verifier
        );
      } else {
        accessTokenResponse = await this.client.exchangeOAuthCodeForAccessToken(
            authCode,
            this.configuration.clientId,
            this.configuration.clientSecret,
            this.getRedirectURI()
        );
      }

      if (!accessTokenResponse.wasSuccessful() || !accessTokenResponse.response.access_token) {
        console.error('Failed to get Access Token')
        return null;
      }

      return accessTokenResponse.response;
    } catch (err) {
      return null;
    }
  }

  // :snippet-start: logInUser
  logInUser(accessToken: AccessToken, res: Response) {
    res.cookie(this.configuration.accessTokenCookieName, accessToken.access_token, { httpOnly: true });
    res.cookie(this.configuration.idTokenCookieName, JSON.stringify(jose.decodeJwt(accessToken.id_token)), { httpOnly: false });

    if (this.configuration.enableRefreshTokens && accessToken.refresh_token) {
      res.cookie(this.configuration.refreshTokenCookieName, accessToken.refresh_token, { httpOnly: true });
    }
  }
  // :snippet-end:

  sendToLoginPage(res: Response) {
    const state = crypto.randomUUID();
    res.cookie(this.configuration.oauthStateCookieName, state, { httpOnly: true });

    let redirect = `${this.configuration.baseURL}/oauth2/authorize?client_id=${this.configuration.clientId}&`+
        `scope=${encodeURIComponent(this.configuration.scope)}&`+
        `response_type=code&`+
        `redirect_uri=${this.getRedirectURI()}&`+
        `state=${state}`;
    if (this.configuration.enablePKCE) {
      const pkcePair = pkceChallenge.default();
      res.cookie(this.configuration.oauthPKCECookieName, { verifier: pkcePair.code_verifier, challenge: pkcePair.code_challenge }, { httpOnly: true });
      redirect += `&code_challenge=${pkcePair.code_challenge}&code_challenge_method=S256`;
    }

    res.redirect(302, redirect);
  }

  /**
   * Redirects the browser to the FusionAUth logout page.
   *
   * @param res The response that is used to send the redirect.
   */
  // :snippet-start: sendToLogoutPage
  sendToLogoutPage(res: Response) {
    res.redirect(302, `${this.configuration.baseURL}/oauth2/logout?client_id=${this.configuration.clientId}`);
  }
  // :snippet-end:

  /**
   * Checks if the user has the specified roles.
   *
   * @param req The request used to fetch the user cookies from.
   * @param res The response used to store updated user cookie values if needed.
   * @param roles The roles to check for.
   * @returns True if the user has the specified roles, false otherwise.
   */
  // :snippet-start: userHasAccess
  async userHasAccess(req: Request, res: Response, roles: Array<string>): Promise<boolean> {
    const jwt = await this.getUser(req, res);

    // @ts-ignore
    if (!jwt || !jwt.roles || jwt.roles.length === 0) {
      return false;
    }

    // @ts-ignore
    return jwt.roles.some(role => roles.includes(role));
  }
  // :snippet-end:

  /**
   * Checks if the user is logged in.
   *
   * @param req The request used to fetch the user cookies from.
   * @param res The response used to store updated user cookie values if needed.
   * @returns True if the user is logged in, false otherwise.
   */
  async userLoggedIn(req: Request, res: Response): Promise<boolean> {
    return await this.getUser(req, res) !== null;
  }

  private getRedirectURI(): string {
    return `http://localhost:${this.configuration.port}/oauth-redirect`;
  }

  private async refreshToken(refreshToken: string): Promise<AccessToken | null> {
    const response = await this.client.exchangeRefreshTokenForAccessToken(
        refreshToken,
        this.configuration.clientId,
        this.configuration.clientSecret,
        this.configuration.scope,
        ''
    );
    if (!response.wasSuccessful()) {
      return null;
    }

    return response.response;
  }

  // :snippet-start: handleJWTException
  private async handleJWTException(req: Request, res: Response, e: Error): Promise<JWTPayload | null> {
    let payload = null;
    if (e instanceof jose.errors.JWTExpired) {
      // Refreshing is disabled, so the user is logged out
      if (!this.configuration.enableRefreshTokens) {
        return null;
      }

      // Load the refresh token from the cookie
      let refreshToken = req.cookies[this.configuration.refreshTokenCookieName];
      if (!refreshToken) {
        return null;
      }

      // Try refreshing the token
      let response = await this.refreshToken(refreshToken);
      if (!response) {
        return null;
      }

      // Update the cookies making the assumption that they are both valid since we just got them from FusionAuth
      let accessToken = response.access_token;
      res.cookie(this.configuration.accessTokenCookieName, accessToken, { httpOnly: true });

      if (response.refresh_token) {
        refreshToken = response.refresh_token;
        res.cookie(this.configuration.refreshTokenCookieName, refreshToken, { httpOnly: true });
      }

      payload = jose.decodeJwt(response.id_token);
      res.cookie(this.configuration.idTokenCookieName, JSON.stringify(payload), { httpOnly: false });
    }

    return payload;
  }
  // :snippet-end:
}
