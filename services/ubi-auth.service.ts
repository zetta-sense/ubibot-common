import {Inject, Injectable, InjectionToken} from '@angular/core';
import {UbiUtilsService} from './ubi-utils.service';
import {RemoteAccountService} from '../remote/remote-account.service';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable, from} from 'rxjs';

export const UBIBOT_AUTH_CONFIGURATION = new InjectionToken<UbiAuthConfig>('UBIBOT_AUTH_CONFIGURATION');
export interface UbiAuthConfig {
    // authPage: string;
    [key: string]: any;
}

@Injectable()
export class UbiAuthService {

    authenticationState = new BehaviorSubject(null);
    redirectUrl: string;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService,
                private remoteAccount: RemoteAccountService,
                private router: Router,
                @Inject(UBIBOT_AUTH_CONFIGURATION) private authConfig: UbiAuthConfig) {

    }

    init() {
        this.checkToken();
    }


    /**
     * 改为动态获取，因为登陆时会随时更新config的agebt配置
     *
     * @returns
     * @memberof UbiAuthService
     */
    getStorageKey() {
        return `me-${this.ubibotCommonConfig.DeployAgent}`;
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
                    localStorage.setItem(this.getStorageKey(), JSON.stringify(resp));
                    this.authenticationState.next(true);
                    resolve(resp);
                })
                .catch(reject);
        });
    }


    /**
     * 通过本地缓存读取当前用户信息
     *
     * @returns
     * @memberof UbiAuthService
     */
    me() {
        try {
            let resp = JSON.parse(localStorage.getItem(this.getStorageKey()));
            return resp;
        } catch (e) {
        }
        return null;
    }

    /**
     * 不通过本地缓存，立即访问服务器读取当前用户信息
     *
     * @returns {Observable<any>}
     * @memberof UbiAuthService
     */
    meAsync(): Observable<any> {
        return from(this.remoteAccount.me());
    }

    username() {
        return this.me() && this.me().account.username;
    }

    userId() {
        return this.me() && this.me().account.user_id;
    }

    token() {
        try {
            let resp = JSON.parse(localStorage.getItem(this.getStorageKey()));
            return resp.token_id;
        } catch (e) { }

        return null;
    }

    logout(): Promise<any> {
        this.removeMe();

        this.ubiUtils.resetLanguage();
        this.redirectUrl = '/'; // 当登出时，应该重置redirectUrl

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
            const href = window.location.href;
            const origin = window.location.origin;
            this.redirectUrl = href.slice(origin.length);
            // console.log('wat the fak?', this.redirectUrl);
            this.authenticationState.next(true);
        }else{
            this.authenticationState.next(false);
        }
    }

    private removeMe() {
        localStorage.setItem(this.getStorageKey(), null);
    }


}
