import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-make-change-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './make-change-page.component.html',
  styleUrls: ['./make-change-page.component.css']
})
export class MakeChangePageComponent {

  amount = 0;

  change: { total: number; nickels: number; pennies: number } | null = null;

  makeChange() {
    // work in whole cents so floating-point rounding can't drop a penny
    const cents = Math.round(this.amount * 100);
    const nickels = Math.floor(cents / 5);
    const pennies = cents % 5;
    this.change = {nickels, pennies, total: cents / 100};
  }

}
