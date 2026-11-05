import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-account',
  template: `
    <header class="titlebar">
      <a class="button" routerLink="/">Logout</a>
    </header>
    <main class="centerContainer">
      <p>User info will display here</p>
    </main>
  `,
})
export class Account {}
