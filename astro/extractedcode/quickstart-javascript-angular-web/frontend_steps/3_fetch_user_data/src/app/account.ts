import { Component, Inject, signal } from '@angular/core';
import { FusionAuthService } from '@fusionauth/angular-sdk';
import type { UserInfo } from '@fusionauth/angular-sdk';
import { Router } from '@angular/router';

interface UserProfileResponse {
  given_name?: string;
  family_name?: string;
  birthdate?: string;
}

interface UserProfile {
  givenName: string;
  familyName: string;
  birthdate: string;
}

@Component({
  selector: 'app-account',
  template: `
    @if (fusionAuth.isLoggedInSignal() && !isFetchingUserInfo()) {
      <header class="titlebar">
        <span class="white">{{ userInfo()?.email }}</span>
        <button class="button" type="button" (click)="logout()">Logout</button>
      </header>
      <main class="centerContainer">
        <div class="userInfoGrid">
          <div>Name:</div>
          <div>{{ userProfile().givenName }} {{ userProfile().familyName }}</div>
          <div>Birthdate:</div>
          <div>{{ userProfile().birthdate }}</div>
        </div>
        <br />
        <button class="button" type="button" (click)="showUserInfo()">Show your info</button>
      </main>
    }
  `,
})
export class Account {
  protected readonly isFetchingUserInfo = signal(false);
  protected readonly userInfo = signal<UserInfo | null>(null);
  protected readonly userProfile = signal<UserProfile>({
    givenName: '',
    familyName: '',
    birthdate: '',
  });

  constructor(
    protected readonly fusionAuth: FusionAuthService,
    @Inject(Router) private readonly router: Router,
  ) {
    if (!this.fusionAuth.isLoggedIn()) {
      void this.router.navigateByUrl('/');
      return;
    }
    void this.loadUserInfo();
  }

  protected logout(): void {
    this.fusionAuth.logout();
  }

  protected async showUserInfo(): Promise<void> {
    try {
      const response = await fetch('http://localhost:9011/app/me', {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      const info = (await response.json()) as UserProfileResponse;

      this.userProfile.set({
        givenName: info.given_name ?? '',
        familyName: info.family_name ?? '',
        birthdate: info.birthdate ?? '',
      });
    }
    catch (error) {
      console.error('Unable to fetch user profile', error);
    }
  }

  private async loadUserInfo(): Promise<void> {
    this.isFetchingUserInfo.set(true);
    try { this.userInfo.set(await this.fusionAuth.getUserInfo<UserInfo>()); }
    catch (error) { console.error('Unable to fetch FusionAuth user info', error); }
    finally { this.isFetchingUserInfo.set(false); }
  }
}
