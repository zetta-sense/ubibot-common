import {Injectable} from '@angular/core';
import {UbiUtilsService} from './ubi-utils.service';
import {Router} from '@angular/router';
import {RemoteAccountService} from '../remote/remote-account.service';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';

@Injectable()
export class UbiAuthService {

    redirectUrl: string;

    storageKey;

    constructor(private ubiUtils: UbiUtilsService,
                private ubibotCommonConfig: UbibotCommonConfigService,
                private router: Router,
                private remoteAccount: RemoteAccountService) {

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
        try{
            let resp = JSON.parse(localStorage.getItem(this.storageKey));
            return resp;
        }catch(e){}
        return null;
    }

    username() {
        return this.me() && this.me().account.username;
    }

    userId() {
        return this.me() && this.me().account.user_id;
    }

    token() {
        try{
            let resp = JSON.parse(localStorage.getItem(this.storageKey));
            return resp.token_id;
        }catch(e){}

        return null;
    }

    logout() {
        this.removeMe();

        this.ubiUtils.resetLanguage();

        this.router.navigate(['/auth']);
    }

    removeMe() {
        localStorage.setItem(this.storageKey, null);
    }


}
