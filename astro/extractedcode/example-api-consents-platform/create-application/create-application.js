import {FusionAuthClient} from '@fusionauth/typescript-client';
import 'dotenv/config'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const FUSIONAUTH_API_KEY = process.env.FUSIONAUTH_API_KEY;
const BASE_URL = process.env.BASE_URL;

const client = new FusionAuthClient(FUSIONAUTH_API_KEY, BASE_URL);

// :snippet-start: createApplication
async function createApplication() {
  try {
    const response = await client.createApplication('e9fdb985-9173-4e01-9d73-ac2d60d1dc8e', {
      application: {
        name: 'MoneyScope',
        registrationConfiguration: { 
          enabled: true,
          type: 'basic'
        },
        oauthConfiguration: {
          clientSecret: 'super-secret-secret-that-should-be-regenerated-for-production',
          authorizedRedirectURLs: [
            "http://localhost:8080/oauth-redirect"
          ],
          logoutURL: "http://localhost:8080/oauth2/logout",
          enabledGrants: [
            'authorization_code',
            'refresh_token'
          ],
          generateRefreshTokens: true,
          consentMode: 'AlwaysPrompt',
          relationship: 'ThirdParty',
          providedScopePolicy: {
            profile: {
              required: true
            },
            email: {
              required: true
            }
          }
        }
      }
    });
    
    console.log('Application created:', response.response);
    return response.response.application.id;
  } catch (error) {
    console.error('Error creating application:', error);
  }
}
// :snippet-end:

// :snippet-start: createScopes
async function createScopes(applicationId) {

const analyticsScopes = [
  {
    name: "accounts.read",
    description: "Basic account information and balances",
    required: true,
    consent: "Read basic account and balance information"
  },
  {
    name: "profile.read",
    description: "User profile and contact information",
    required: true,
    consent: "Read user profile information"
  },
  {
    name: "transactions.read",
    description: "Transaction history and details",
    required: true,
    consent: "Read transaction history"
  },
  {
    name: "investments.read",
    description: "Investment portfolio information",
    required: false,
    consent: "Read investment profile information"
  },
  {
    name: "creditScore.read",
    description: "Access credit score information",
    required: false,
    consent: "Read credit score information"
  }
];


  try {
    for (const scope of analyticsScopes) {
      const req = {
        scope: {
          name: scope.name,
          required: scope.required,
          defaultConsentMessage: scope.consent,
          defaultConsentDetail: scope.description,
          description: scope.description
        }
      };
      const useCreatedScopeId = "";
      const response = await client.createOAuthScope(applicationId, useCreatedScopeId, req);
      
      console.log('Scope created:', response);
    }

  } catch (error) {
    console.error('Error creating scope:', JSON.stringify(error));
  }
}
// :snippet-end:

(async () => {
  const applicationId = await createApplication();
  if (applicationId) {
    await createScopes(applicationId);
  }
})();


