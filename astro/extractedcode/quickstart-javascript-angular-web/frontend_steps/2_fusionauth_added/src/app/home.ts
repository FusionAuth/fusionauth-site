import { Component, Inject, signal } from '@angular/core';
import { FusionAuthService } from '@fusionauth/angular-sdk';
import type { UserInfo } from '@fusionauth/angular-sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <header class="titlebar">
      @if (fusionAuth.isLoggedInSignal()) {
        <span class="white">{{ userInfo()?.email }}</span>
        <button class="button" type="button" (click)="logout()">Logout</button>
      } @else {
        <button class="button" type="button" (click)="login()">Login</button>
      }
    </header>
    <main class="centerContainer">
      <div>Log in to request your information</div>
    </main>
  `,
})
export class Home {
  protected readonly userInfo = signal<UserInfo | null>(null);

  constructor(
    protected readonly fusionAuth: FusionAuthService,
    @Inject(Router) private readonly router: Router,
  ) {
    if (this.fusionAuth.isLoggedIn()) {
      void this.loadUserInfo();

      if (sessionStorage.getItem('justLoggedIn') === 'true') {
        sessionStorage.removeItem('justLoggedIn');
        void this.router.navigateByUrl('/account');
      }
    }
  }

  protected login(): void {
    sessionStorage.setItem('justLoggedIn', 'true');
    this.fusionAuth.startLogin();
  }

  protected logout(): void {
    this.fusionAuth.logout();
  }

  private async loadUserInfo(): Promise<void> {
    try {
      this.userInfo.set(await this.fusionAuth.getUserInfo<UserInfo>());
    } catch (error) {
      console.error('Unable to fetch FusionAuth user info', error);
    }
  }
}
