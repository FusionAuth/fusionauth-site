import { jwtDecode } from "jwt-decode";
import { Authenticator } from "remix-auth";
import type { OAuth2Strategy as OAuth2StrategyType } from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";

type User = string;
export let authenticator = new Authenticator<User>();

const authOptions: OAuth2StrategyType.ConstructorOptions = {
    authorizationEndpoint: `${process.env.AUTH_URL}/authorize`,
    tokenEndpoint: `${process.env.AUTH_URL}/token`,
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirectURI: process.env.AUTH_CALLBACK_URL!,
    scopes: ["openid", "email", "profile", "offline_access"],
};

const authStrategy = new OAuth2Strategy(
    authOptions,
    async ({tokens}) => {
        const jwt = await jwtDecode<any>(tokens.idToken());
        return jwt?.email || "missing email check scopes";
    }
);

authenticator.use(
    authStrategy,
    "FusionAuth"
);
