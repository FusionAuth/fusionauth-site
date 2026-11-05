import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  template: `
    <header class="titlebar">
      <a class="button" routerLink="/account">Login</a>
    </header>
    <main class="centerContainer">
      <div>Log in to request your information</div>
    </main>
  `,
})
export class Home {}
