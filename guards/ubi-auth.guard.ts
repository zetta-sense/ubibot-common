import {Inject, Injectable} from '@angular/core';
import {CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationExtras} from '@angular/router';
import {Observable} from 'rxjs';
import {UbiAuthConfig, UbiAuthService, UBIBOT_AUTH_CONFIGURATION} from '../services/ubi-auth.service';

@Injectable()
export class UbiAuthGuard implements CanActivate, CanActivateChild {

    constructor(private authService: UbiAuthService,
                private router: Router,
                @Inject(UBIBOT_AUTH_CONFIGURATION) private authConfig: UbiAuthConfig) {

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
        // tag: 虽然如果在ionic 4的时候，需要call navController.setDirection('root')会更正确，但实际上影响不大，为了不产生入侵式影响，所以这里忽略此操作
        // this.router.navigate([this.authConfig.authPage], navigationExtras);
        return false;
    }
}
