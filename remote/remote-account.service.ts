import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UbiExtraPreference } from '../entities/ubi-extra-preference.entity';

@Injectable()
export class RemoteAccountService {

    constructor(private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    loginEncrypted(username: string, passwordSha256: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', passwordSha256);
        params = params.set('password_type', 'sha256');

        return this.http.post(url, params).toPromise();
    }

    login(username: string, password: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', password);

        return this.http.post(url, params).toPromise();
    }

    loginAsAdmin() {

    }

    me(): Promise<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/view`;
        return this.http.get(url).toPromise();
    }

    bindDeviceToken(token: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/push_service/bind`;

        let params = new HttpParams();
        params = params.set('push_key', token);

        return this.http.post(url, params).toPromise();
    }

    unbindDeviceToken(token: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/push_service/unbind`;

        let params = new HttpParams();
        params = params.set('push_key', token);

        return this.http.post(url, params).toPromise();
    }


    /**
     * User Setting用户设定管理
     * Update User Settings 修改用户设定
     * send an HTTP POST to http://api.ubibot.cn/accounts/settings/update
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * 传送Payload例如json
     *
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    saveExtraPref(ubiExtraPref: UbiExtraPreference): Observable<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/settings/update`;
        const payload = ubiExtraPref.toString();

        return this.http.post(url, payload).pipe(
            map((resp: any) => resp)
        );
    }


    /**
     * Get User Settings 查看用户设定
     * send an HTTP POST to http://api.ubibot.cn/accounts/settings/get
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * 返回值例如：
     * {"result":"success","server_time":"2017-08-29T05:03:34Z","settings":"{\"asdf\":\"aa\"}"}
     *
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    getExtraPref(): Observable<UbiExtraPreference> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/settings/get`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                const jsonStr = resp.settings;
                const ubiExtraPref = new UbiExtraPreference(jsonStr);
                return ubiExtraPref;
            })
        );
    }
}
