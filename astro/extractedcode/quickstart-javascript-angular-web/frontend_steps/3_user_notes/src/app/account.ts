import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FusionAuthService } from '@fusionauth/angular-sdk';
import type { UserInfo } from '@fusionauth/angular-sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  imports: [FormsModule],
  template: `
    @if (fusionAuth.isLoggedInSignal() && !isFetchingUserInfo()) {
      <header class="titlebar">
        <span class="white">{{ userInfo()?.email }}</span>
        <button class="button" type="button" (click)="logout()">Logout</button>
      </header>
      <main class="centerContainer">
        <h2>Your note</h2>
        <textarea class="note" [(ngModel)]="note" (input)="saved.set(false)"></textarea>
        <button class="button" type="button" (click)="saveNote()">Save note</button>
        @if (saved()) {
          <p>Saved</p>
        }
      </main>
    }
  `,
})
export class Account {
  protected readonly isFetchingUserInfo = signal(false);
  protected readonly userInfo = signal<UserInfo | null>(null);
  protected readonly saved = signal(false);
  protected note = '';

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

  protected saveNote(): void {
    localStorage.setItem(this.noteKey(), this.note);
    this.saved.set(true);
  }

  // sub is the user's FusionAuth Id, so each user gets their own note
  private noteKey(): string {
    return `note-${this.userInfo()?.sub}`;
  }

  private async loadUserInfo(): Promise<void> {
    this.isFetchingUserInfo.set(true);
    try {
      const info = await this.fusionAuth.getUserInfo<UserInfo>();
      this.userInfo.set(info);
      this.note = localStorage.getItem(this.noteKey()) ?? `Hello ${info.given_name ?? info.email}! This note is yours alone.`;
    }
    catch (error) { console.error('Unable to fetch FusionAuth user info', error); }
    finally { this.isFetchingUserInfo.set(false); }
  }
}
