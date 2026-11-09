import { authShot, piedPiperOauthState } from '../authentication/_shared.mjs';

const thirdPartyConsent = piedPiperOauthState(14, {
  relationship: 'ThirdParty', consentMode: 'AlwaysPrompt', providedScopePolicy: { email: { enabled: true, required: true }, phone: { enabled: true, required: false } },
});

export const shots = {
  'authenticate-oauth-consent': authShot({ temporaryState: [thirdPartyConsent] }),
};
