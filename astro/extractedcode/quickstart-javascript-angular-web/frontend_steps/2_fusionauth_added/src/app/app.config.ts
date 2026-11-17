import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { FusionAuthModule } from '@fusionauth/angular-sdk';
import type { FusionAuthConfig } from '@fusionauth/angular-sdk';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

const fusionAuthConfig: FusionAuthConfig = {
  redirectUri: 'http://localhost:3000',
  postLogoutRedirectUri: 'http://localhost:3000',
  shouldAutoRefresh: true,
  scope: 'openid email profile offline_access',
  clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
  serverUrl: 'http://localhost:9011',
  onRedirect: () => console.log('Login successful'),
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    importProvidersFrom(FusionAuthModule.forRoot(fusionAuthConfig)),
  ],
};
