import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FusionAuthService, UserInfo } from '@fusionauth/angular-sdk';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private fusionAuthService: FusionAuthService = inject(FusionAuthService);

  isLoggedIn: boolean = this.fusionAuthService.isLoggedIn();
  userInfo: UserInfo | null = null;
  isGettingUserInfo: boolean = false;
  subscription?: Subscription;

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.subscription = this.fusionAuthService
        .getUserInfoObservable({
          onBegin: () => (this.isGettingUserInfo = true),
          onDone: () => (this.isGettingUserInfo = false),
        })
        .subscribe({
          next: (userInfo) => (this.userInfo = userInfo),
          error: (error) => console.error(error),
        });
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  logout() {
    this.fusionAuthService.logout();
  }

  login() {
    this.fusionAuthService.startLogin();
  }
}
