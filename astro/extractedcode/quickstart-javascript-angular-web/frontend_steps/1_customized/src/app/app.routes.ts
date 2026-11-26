import { Routes } from '@angular/router';
import { Account } from './account';
import { Home } from './home';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'account', component: Account },
  { path: '**', redirectTo: '' },
];
