import { Component, Inject, signal } from '@angular/core';
import { FusionAuthService } from '@fusionauth/angular-sdk';
import type { UserInfo } from '@fusionauth/angular-sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  template: `
    @if (fusionAuth.isLoggedInSignal() && !isFetchingUserInfo()) {
      <header class="titlebar">
        <span class="white">{{ userInfo()?.email }}</span>
        <button class="button" type="button" (click)="logout()">Logout</button>
      </header>
      <main class="centerContainer">
        <p>User info will display here</p>
      </main>
    }
  `,
})
export class Account {
  protected readonly isFetchingUserInfo = signal(false);
  protected readonly userInfo = signal<UserInfo | null>(null);

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

  private async loadUserInfo(): Promise<void> {
    this.isFetchingUserInfo.set(true);
    try { this.userInfo.set(await this.fusionAuth.getUserInfo<UserInfo>()); }
    catch (error) { console.error('Unable to fetch FusionAuth user info', error);}
    finally { this.isFetchingUserInfo.set(false); }
  }
}
