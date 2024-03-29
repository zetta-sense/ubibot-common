import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { UbiExtraPreference } from '../entities/ubi-extra-preference.entity';
import { UbiError } from '../errors/UbiError';
import * as lz from 'lz-string';
import { UbiStorageService } from '../services/ubi-storage.service';
import { UbiAccountInfo } from '../entities/ubi-account-info.entity';

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
    totalItems: number; // 注意这个是分类后的items
    totalUnread: number; // 注意这个是分类后的unread

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

    constructor(
        private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService,
        private ubiStorage: UbiStorageService,
    ) {
    }

    loginEncrypted(username: string, passwordSha256: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', passwordSha256);
        params = params.set('password_type', 'sha256');
        params = params.set('expire_in_seconds', `${365 * 24 * 60 * 60}`);

        return this.http.post(url, params).toPromise();
    }

    login(username: string, password: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', password);

        return this.http.post(url, params).toPromise();
    }

    loginAsAdmin(username: string, passwordSha256: string, target: string) {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/admin_target_login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', passwordSha256);
        params = params.set('password_type', 'sha256');
        params = params.set('target', target);

        return this.http.post(url, params).toPromise();
    }

    me(): Promise<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/view`;
        return this.http.get(url).pipe().toPromise();
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

    updateTimezone(userId: string, timezone: string, passwordSha256: string) {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/update`;

        const payload = {
            user_id: userId,
            timezone: timezone,
            password: passwordSha256,
            password_type: 'sha256',
        };

        // todo: 是否要考虑压缩，届时将需要启用新的服务器api来逐步替换
        // console.log(lz.compress(payload);

        return this.http.post(url, payload).pipe(
            map((resp: any) => resp),
            switchMap((resp) => {
                // 更新本地副本
                return of(resp);
            }),
            // switchMap(() => this.),
        );
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

        // todo: 是否要考虑压缩，届时将需要启用新的服务器api来逐步替换
        // console.log(lz.compress(payload);

        return this.http.post(url, payload).pipe(
            map((resp: any) => resp),
            switchMap((resp) => {
                // 更新本地副本
                this.ubiStorage.save(this.getExtraPrefKey(), payload);
                return of(resp);
            }),
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
     * @param {boolean} [forceSync=false] 是否强制与服务器同步，不强制时则尝试从缓存读取
     * @param {boolean} [allowFallback=true] 服务器同步失败时是否允许使用本地副本
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    getExtraPref(forceSync: boolean = false, allowFallback: boolean = true): Observable<UbiExtraPreference> {

        // 尝试读取本地缓存
        let localUbiExtrPref: UbiExtraPreference;
        try {
            const strPref = this.ubiStorage.get(this.getExtraPrefKey());

            if (strPref) {
                console.log('User pref => found in cache, returned.');

                localUbiExtrPref = new UbiExtraPreference(strPref);
            }
        } catch (e) { }

        // 一般情况下若本地缓存可用则直接返回本地缓存
        if (!forceSync && localUbiExtrPref) {
            return of(localUbiExtrPref);
        }

        // 与服务器同步
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/settings/get`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                console.log('User pref => loading from ubibot cloud...');

                const jsonStr = resp.settings;

                this.ubiStorage.save(this.getExtraPrefKey(), jsonStr);

                const ubiExtraPref = new UbiExtraPreference(jsonStr);
                return ubiExtraPref;
            }),
            catchError((err) => {
                // 若服务无法返回且本地无相应副本则抛出错误
                if (allowFallback && localUbiExtrPref) {
                    console.log('Loading user pref from ubibot cloud failed. Fallback to local cache.');

                    return of(localUbiExtrPref);
                } else {
                    return throwError(err);
                }
            }),
        );
    }

    /**
     * 强制从服务器重新加载user pref
     *
     * @returns {Observable<UbiExtraPreference>}
     * @memberof RemoteAccountService
     */
    syncExtraPref(): Observable<UbiExtraPreference> {
        return this.getExtraPref(true);
    }

    private getExtraPrefKey() {
        return `user-pref-${this.ubibotCommonConfig.DeployAgent}`;
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
        params['itemsPerPage'] = this.ubibotCommonConfig.DefaultItemsPerPage;

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

    countUnreadMessages(): Observable<number> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/messages/list`;

        const params = {};
        params['itemsPerPage'] = 0;

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => {
                const messagesResp = resp as UbiMessagesResponse;
                return messagesResp.totalUnread;
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

    /**
     * 将所有消息标记为read
     *
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    markAllMessagesAsRead(): Observable<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/messages/read_all`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    /**
     * Create User Account (Internal)
     * To create a user, send an HTTP POST to http://api.ubibot.cn/accounts/create
     *
     * JSON Body FIELDS:
     * username, password, email, timezone
     *
     * Example Body:
     * {"username":"abc","password":"123","email":"123@gmail.com", “timezone”: “Europe/London”, "captcha_code":""}
     * Captcha Image URL: http://api.ubibot.cn/accounts/captcha
     * Response:
     * {"result":"success","user":{"username":"scdcd","email":"asdf@dfd.cddddom","account_key":"d9b4cb5cf9be1324380817232aaef9ed"}}
     * account_key is used for managing channels through the API.
     *
     * @param {string} email
     * @param {string} username
     * @param {string} password
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    registerByEmail(email: string, username: string, password: string): Observable<any> {
        if (!email) throw new UbiError('Email is required for this API!');
        if (!username) throw new UbiError('Username is required for this API!');
        if (!password) throw new UbiError('Password is required for this API!');

        const params = {
            email: email,
            username: username,
            password: password,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/create`;
        return this.http.post(url, params).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * 手机注册-创建用户账户-第2步：
     *
     * send an HTTP POST to http://api.ubibot.cn/accounts/create_mobile_step2
     *
     * JSON Body FIELDS:
     * mobile, sms_code, password, timezone
     * timezone选填，可默认为一个
     * sms_code为用户收到短信
     *
     * @param {string} mobile
     * @param {string} sms_code fetch by step 1
     * @param {string} username
     * @param {string} password
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    registerByMobile(mobile: string, sms_code: string, username: string, password: string): Observable<any> {
        if (!mobile) throw new UbiError('Mobile is required for this API!');
        if (!sms_code) throw new UbiError('sms_code is required for this API!');
        if (!username) throw new UbiError('Username is required for this API!');
        if (!password) throw new UbiError('Password is required for this API!');

        const params = {
            mobile: mobile,
            sms_code: sms_code,
            username: username,
            password: password,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/create_mobile_step2`;
        return this.http.post(url, params).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    /**
     * User Account Management(内部使用)
     *
     * 手机注册-创建用户账户-第1步：
     * send an HTTP GET/POST to http://api.ubibot.cn/accounts/create_mobile_step1
     *
     * JSON Body FIELDS:
     * mobile
     *
     * @param {string} mobile
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    sendSMSRegisterCode(mobile: string): Observable<any> {
        if (!mobile) throw new UbiError('Mobile is required for this API!');

        const params = {
            mobile: mobile,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/create_mobile_step1`;
        return this.http.post(url, params).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * Add Email Address and Send Verify Code (Internal)
     * 适用于短信或其他注册方式，后添加邮箱绑定。
     * send an HTTP GET/POST request to http://api.ubibot.cn/accounts/verify/add_email_send_verify
     *
     *
     * 如果账户已经绑定邮箱(email_status是live)，不能通过此种接口来修改邮箱。如果email_status是pending, 可以用此接口改其他邮箱。
     * Valid request parameters:
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     * email   (string) – (required): new email address
     *
     * @param {string} email
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    addEmailSendVerify(email: string): Observable<any> {
        if (!email) throw new UbiError('Email is required for this API!');

        let formData: FormData = new FormData();
        formData.append('email', email);

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/verify/add_email_send_verify`;
        return this.http.post(url, formData).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * Verify Email Address  First Time (Internal)
     * 注册后首次进行邮箱验证
     * send an HTTP GET/POST request to http://api.ubibot.cn/accounts/verify/email_verify
     *
     *
     * Valid request parameters:
     * email (string) - (required).
     * email_code (string) – (required)
     *
     * @param {string} email
     * @param {string} code
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    verifyEmail(email: string, code: string): Observable<any> {
        if (!email) throw new UbiError('Email is required for this API!');
        if (!code) throw new UbiError('Code is required for this API!');

        let formData: FormData = new FormData();
        formData.append('email', email);
        formData.append('email_code', code);

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/verify/email_verify`;
        return this.http.post(url, formData).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * 手机添加绑定-第1步：仅限于账户未绑定过任何手机号
     * send an HTTP GET/POST to http://api.ubibot.cn/accounts/bind_mobile_step1
     * Valid request parameters:
     *
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     *
     * JSON Body FIELDS:
     * mobile
     *
     * @param {string} mobile
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    addMobileSendVerify(mobile: string): Observable<any> {
        if (!mobile) throw new UbiError('Mobile is required for this API!');

        let params = {
            mobile: mobile,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/bind_mobile_step1`;
        return this.http.post(url, params).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    /**
     * 手机添加绑定-第2步：仅限于账户未绑定过任何手机号
     * send an HTTP GET/POST to http://api.ubibot.cn/accounts/bind_mobile_step2
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     *
     *
     * JSON Body FIELDS:
     *
     * mobile, sms_code
     * sms_code为用户收到短信
     *
     * @param {string} mobile
     * @param {string} code
     * @returns {Observable<any>}
     * @memberof RemoteAccountService
     */
    verifyMobile(mobile: string, code: string): Observable<any> {
        if (!mobile) throw new UbiError('Mobile is required for this API!');
        if (!code) throw new UbiError('Code is required for this API!');

        let params = {
            mobile: mobile,
            sms_code: code,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/bind_mobile_step2`;
        return this.http.post(url, params).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    checkOauthAlexa(): Observable<boolean> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/oauth/check/alexa`;

        return this.http.get(url).pipe(
            map((resp) => {
                if (resp['exist_oauth'] === true) {
                    return true;
                } else {
                    return false;
                }
            }),
        );
    }
}
