import { Component, inject } from '@angular/core';
import { FusionAuthService } from '@fusionauth/angular-sdk';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  private fusionAuthService = inject(FusionAuthService);

  login() {
    this.fusionAuthService.startLogin();
  }
  register() {
    this.fusionAuthService.startRegistration();
  }
}
