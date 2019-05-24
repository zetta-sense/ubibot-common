import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UbiExtraPreference } from '../entities/ubi-extra-preference.entity';
import { UbiError } from '../errors/UbiError';

export interface UbiMessage {
    body: string;
    created_at: string;
    message_id: string;
    message_status: string;
    message_type: string;
    subject: string;
}

export interface UbiMessagesResponse {
    type: UbiMessageType;

    pageNumber: number;
    itemsPerPage: number;
    currentItems: number;
    totalItems: number;
    totalUnread: number;

    messages: UbiMessage[];
}

export enum UbiMessageType {
    All = '',
    Product = 'product',
    Alerts = 'alerts',
    Finance = 'finance',
    Account = 'account',
    News = 'news',
}

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

        // ref: https://angular.io/guide/http
        // let params = new HttpParams();
        // const params = new FormData();
        // params.set('push_key', token);

        const params = {
            push_key: token
        };

        return this.http.post(url, params).toPromise();
    }

    unbindDeviceToken(token: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/push_service/unbind`;

        const params = {
            push_key: token
        };

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



    /**
     * List User Messages (列出用户账户消息)
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/accounts/messages/list
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * pageNumber (string): page number for the request (optional)
     * message_status (string): read or unread
     * message_type (string): product, news, account,alerts
     *
     * @returns {Observable<UbiMessagesResponse>}
     * @memberof RemoteAccountService
     */
    listMessages(page: number = 0, type: UbiMessageType = UbiMessageType.All): Observable<UbiMessagesResponse> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/messages/list`;

        const params = {};
        params['itemsPerPage'] = 10;

        if (page) {
            params['pageNumber'] = page;
        }

        // 如果是all则不填，否则填写对应的类型
        if (type !== UbiMessageType.All) {
            params['message_type'] = type;
        }

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => {
                const messagesResp = resp as UbiMessagesResponse;
                messagesResp.pageNumber = parseFloat(resp.pageNumber);
                messagesResp.itemsPerPage = parseFloat(resp.itemsPerPage); // 注意这个值服务器返回的是string和number，两者都有
                messagesResp.type = type;
                return messagesResp;
            })
        );
    }


    /**
     * Read A User Message (打开某条信息)
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/accounts/messages/read/MESSAGE_ID
     *
     * Replace MESSAGE_ID
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     */
    readMessage(messageId: string): Observable<any> {
        if (!messageId) throw new UbiError('Message ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/messages/read/${messageId}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }
}
