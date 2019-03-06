import {Inject, Injectable, InjectionToken} from '@angular/core';
import {UbiUtilsService} from './ubi-utils.service';
import {RemoteAccountService} from '../remote/remote-account.service';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';

export const UBIBOT_AUTH_CONFIGURATION = new InjectionToken<UbiAuthConfig>('UBIBOT_AUTH_CONFIGURATION');
export interface UbiAuthConfig {
    authPage: string;
}

@Injectable()
export class UbiAuthService {

    authenticationState = new BehaviorSubject(false);

    redirectUrl: string;

    storageKey;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService,
                private remoteAccount: RemoteAccountService,
                private router: Router,
                @Inject(UBIBOT_AUTH_CONFIGURATION) private authConfig: UbiAuthConfig) {

        this.storageKey = `me-${this.ubibotCommonConfig.DeployAgent}`;
    }

    init() {
        this.checkToken();
    }

    isLoggedIn() {
        // return !!this.token();
        return this.authenticationState.value;
    }

    isLoggedInAysnc(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAccount.me()
                .then((resp) => {
                    console.log(resp);
                    resolve(resp);
                })
                .catch(reject);
        });
    }

    login(username: string, password: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAccount
                .loginEncrypted(username, this.ubiUtils.sha256(password))
                .then((resp) => {
                    localStorage.setItem(this.storageKey, JSON.stringify(resp));
                    this.authenticationState.next(true);
                    resolve(resp);
                })
                .catch(reject);
        });
    }

    me() {
        try {
            let resp = JSON.parse(localStorage.getItem(this.storageKey));
            return resp;
        } catch (e) {
        }
        return null;
    }

    username() {
        return this.me() && this.me().account.username;
    }

    userId() {
        return this.me() && this.me().account.user_id;
    }

    token() {
        try {
            let resp = JSON.parse(localStorage.getItem(this.storageKey));
            return resp.token_id;
        } catch (e) { }

        return null;
    }

    logout(): Promise<any> {
        this.removeMe();

        this.ubiUtils.resetLanguage();

        // this.router.navigate([this.authConfig.authPage]);
        this.authenticationState.next(false);

        return Promise.resolve();
    }

    bindDeviceToken(token: string): Promise<any> {
        return this.remoteAccount.bindDeviceToken(token);
    }

    unbindDeviceToken(token: string): Promise<any> {
        return this.remoteAccount.unbindDeviceToken(token);
    }

    private checkToken() {
        if(this.token()) {
            this.authenticationState.next(true);
        }
    }

    private removeMe() {
        localStorage.setItem(this.storageKey, null);
    }


}
