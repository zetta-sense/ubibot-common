import {Inject, Injectable, InjectionToken} from '@angular/core';
import {UbiUtilsService} from './ubi-utils.service';
import {RemoteAccountService} from '../remote/remote-account.service';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';
import {Router} from '@angular/router';

export const UBIBOT_AUTH_CONFIGURATION = new InjectionToken<UbiAuthConfig>('UBIBOT_AUTH_CONFIGURATION');
export interface UbiAuthConfig {
    authPage: string;
}

@Injectable()
export class UbiAuthService {

    redirectUrl: string;

    storageKey;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService,
                private remoteAccount: RemoteAccountService,
                private router: Router,
                @Inject(UBIBOT_AUTH_CONFIGURATION) private authConfig: UbiAuthConfig) {

        this.storageKey = `me-${this.ubibotCommonConfig.DeployAgent}`;
    }

    isLoggedIn() {
        return !!this.token();
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

    logout() {
        this.removeMe();

        this.ubiUtils.resetLanguage();

        this.router.navigate([this.authConfig.authPage]);
    }

    removeMe() {
        localStorage.setItem(this.storageKey, null);
    }


}
