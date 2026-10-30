import { exampleApp } from './_shared.mjs';

export const shots = {
  'five-minute-login': { signedOut: true, temporaryResources: [exampleApp] },
  'five-minute-login-not-registered': { temporaryResources: [exampleApp] },
};
