// types/express-session.d.ts
import "express-session";

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    userSession?: {
      challenge: string;
      verifier: string;
      stateValue: string;
    };
  }
}

