import {CanActivateFn, Router} from "@angular/router";
import {FusionAuthService} from "@fusionauth/angular-sdk";
import {inject} from "@angular/core";

export function authGuard(loggedIn: boolean, redirect: string): CanActivateFn {
  return () => {
    const fusionAuthService = inject(FusionAuthService);
    const router = inject(Router);
    return fusionAuthService.isLoggedIn() === loggedIn || router.createUrlTree([redirect]);
  }
}
