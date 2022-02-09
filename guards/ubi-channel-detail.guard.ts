// Copyright (c) 2022 gorebill
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { UbiAuthConfig, UbiAuthService, UBIBOT_AUTH_CONFIGURATION } from '../services/ubi-auth.service';


/**
 * 因为需要考虑读取channel信息，目前不实现这个guard
 *
 * @export
 * @class UbiChannelDetailGuard
 * @implements {CanActivate}
 * @implements {CanActivateChild}
 */
@Injectable()
export class UbiChannelDetailGuard implements CanActivate, CanActivateChild {

    constructor(
        private authService: UbiAuthService,
        private router: Router,
        private route: ActivatedRoute,
    ) {

    }

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        let url: string = state.url;
        return this.checkAuthority(url);
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.canActivate(route, state);
    }


    checkAuthority(url: string): boolean {
        // Create a dummy session id
        let sessionId = 123456789;

        // Set our navigation extras object
        // that contains our global query params and fragment
        let navigationExtras: NavigationExtras = {
            queryParams: { 'session_id': sessionId },
            fragment: 'anchor'
        };

        // Navigate to the login page with extras
        // this.router.navigate([this.authConfig.authPage], navigationExtras);
        // this.router.navigate(['', { outlets: { secondary: ['channel-detail', channel.channel_id, 'home'] } }], { relativeTo: this.route });
        return false;
    }
}
