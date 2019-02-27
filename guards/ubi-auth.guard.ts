import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationExtras} from '@angular/router';
import {Observable} from 'rxjs';
import {UbiAuthService} from "../services/ubi-auth.service";

export const UBIBOT_AUTH_GUARD_CONFIGURATION = new InjectionToken<UbiAuthGuardConfig>('UBIBOT_AUTH_GUARD_CONFIGURATION');
export interface UbiAuthGuardConfig {
    authPage: string;
}

@Injectable()
export class UbiAuthGuard implements CanActivate, CanActivateChild {

    constructor(private authService: UbiAuthService,
                private router: Router,
                @Inject(UBIBOT_AUTH_GUARD_CONFIGURATION) private guardConfig: UbiAuthGuardConfig) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let url: string = state.url;
        return this.checkLogin(url);
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }


    checkLogin(url: string): boolean {
        if (this.authService.isLoggedIn()) {
            return true;
        }

        // Store the attempted URL for redirecting
        this.authService.redirectUrl = url;

        // Create a dummy session id
        let sessionId = 123456789;

        // Set our navigation extras object
        // that contains our global query params and fragment
        let navigationExtras: NavigationExtras = {
            queryParams: {'session_id': sessionId},
            fragment: 'anchor'
        };

        // Navigate to the login page with extras
        this.router.navigate([this.guardConfig.authPage], navigationExtras);
        return false;
    }
}
