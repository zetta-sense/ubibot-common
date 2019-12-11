import { Inject, Injectable, InjectionToken } from '@angular/core';
import { UbiUtilsService } from './ubi-utils.service';
import { RemoteAccountService } from '../remote/remote-account.service';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { UbiStorageService } from './ubi-storage.service';

export const UBIBOT_AUTH_CONFIGURATION = new InjectionToken<UbiAuthConfig>('UBIBOT_AUTH_CONFIGURATION');
export interface UbiAuthConfig {
    // authPage: string;
    [key: string]: any;
}

export interface UbiMe {
    account: {
        user_id: string;

        username: string;

        mobile: string;
        email: string;

        email_status: string;
        mobile_status: string;

        balance: string;
        timezone: string;
        last_login_ip: string;

        avatar_base: string;

        backup_ip: string;

        [key: string]: any;
    };

    [key: string]: any;
}


@Injectable({
    providedIn: 'root'
})
export class UbiAuthService {

    authenticationState = new BehaviorSubject<boolean>(null);
    redirectUrl: string;

    constructor(
        private ubiUtils: UbiUtilsService,
        private ubiStorage: UbiStorageService,
        private ubibotCommonConfig: UbibotCommonConfigService,
        private remoteAccount: RemoteAccountService,
        private router: Router,
        @Inject(UBIBOT_AUTH_CONFIGURATION) private authConfig: UbiAuthConfig) {

    }

    init() {
        // alert('init UbiAuthService...');
        this.checkToken();
    }


    /**
     * 改为动态获取，因为登陆时会随时更新config的agent配置
     *
     * @returns
     * @memberof UbiAuthService
     */
    getStorageKey() {
        return `me-${this.ubibotCommonConfig.DeployAgent}`;
    }

    isLoggedIn(): boolean {
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
                    this.ubiStorage.save(this.getStorageKey(), JSON.stringify(resp));
                    this.authenticationState.next(true);
                    resolve(resp);
                })
                .catch(reject);
        });
    }


    loginAsAdmin(username: string, password: string, target: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.remoteAccount
                .loginAsAdmin(username, this.ubiUtils.sha256(password), target)
                .then((resp) => {
                    this.ubiStorage.save(this.getStorageKey(), JSON.stringify(resp));
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
    me(): UbiMe {
        try {
            let resp = JSON.parse(this.ubiStorage.get(this.getStorageKey()));
            return resp;
        } catch (e) {
            throw e;
        }
        return null;
    }

    /**
     * 不通过本地缓存，立即访问服务器读取当前用户信息
     *
     * @returns {Observable<any>}
     * @memberof UbiAuthService
     */
    meAsync(): Observable<UbiMe> {
        return from(this.remoteAccount.me());
    }

    username() {
        return this.me() && this.me().account.username;
    }

    userId() {
        return this.me() && this.me().account.user_id;
    }


    /**
     * 返回关联的zendesk id
     *
     * @returns
     * @memberof UbiAuthService
     */
    zendeskId() {
        // 目前就是对应user_id关联
        return this.me() && this.me().account.user_id;
    }

    token() {
        try {
            let resp = JSON.parse(this.ubiStorage.get(this.getStorageKey()));
            return resp.token_id;
        } catch (e) { }

        return null;
    }

    logout(): Promise<any> {
        // 仅当已经login后才触发next(false)，这样不会导致interceptor在收到unbind触发的force_logout后不断连锁
        if (this.me()) {
            this.removeMe();

            this.ubiUtils.resetLanguage();
            this.redirectUrl = '/'; // 当登出时，应该重置redirectUrl

            // this.router.navigate([this.authConfig.authPage]);
            // alert('someone calling logout...');
            this.authenticationState.next(false);
        }

        return Promise.resolve();
    }

    bindDeviceToken(token: string): Promise<any> {
        return this.remoteAccount.bindDeviceToken(token);
    }

    unbindDeviceToken(token: string): Promise<any> {
        console.log(`Calling unbindDeviceToken with token: ${token}`);
        return this.remoteAccount.unbindDeviceToken(token);
    }

    private checkToken() {
        // alert('calling checkToken...');
        const href = window.location.href;
        const origin = window.location.origin;
        const redirectUrl = href.slice(origin.length);
        // console.log(`checkToken redirectUrl=${redirectUrl}`);

        if (this.token()) {
            this.redirectUrl = redirectUrl;
            // console.log('wat the fak?', this.redirectUrl);
            this.authenticationState.next(true);
        } else {
            this.authenticationState.next(false);
        }
    }

    private removeMe() {
        this.ubiStorage.save(this.getStorageKey(), null);
    }


}
