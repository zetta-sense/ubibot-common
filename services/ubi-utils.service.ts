import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { EnumBasicProductId } from '../enums/enum-basic-product-id.enum';
import { EnumAppError } from '../enums/enum-app-error.enum';
import { TranslateService } from '@ngx-translate/core';
import { UbiError } from '../errors/UbiError';
import { EnumAppConstant } from '../enums/enum-app-constant.enum';
import * as _ from 'lodash';
import * as uuid from 'uuid';
import { SHA2_256 } from '../misc/sha256';
import { FromUTF8Array, ToUTF8Array } from '../misc/utf8arr';
import { AppConfig } from '../../../environments/environment';
import { UbiUserDisplayPipe } from '../core/pipes/ubi-user-display.pipe';

export const UBIBOT_UTILS_DIALOG_AGENT = new InjectionToken<UbibotUtilsDialogAgent>('UBIBOT_UTILS_DIALOG_AGENT');

export declare type IFuncAlert = (msg: string, opts: any) => Promise<any>;
export declare type IFuncError = (msg: string) => Promise<any>;
export declare type IFuncShowLoading = (msg: string) => Promise<any>;
export declare type IFuncHideLoading = () => Promise<any>;
export declare type IFuncSnack = (msg: string) => Promise<any>;
export declare type IFuncPrompt = (msg: string, opts: any) => Promise<any>;
export declare type IFuncConfirm = (msg: string, opts: any) => Promise<any>;

export interface UbibotUtilsDialogAgent {
    alert: IFuncAlert;
    error: IFuncError;
    showLoading: IFuncShowLoading;
    hideLoading: IFuncHideLoading;
    snack: IFuncSnack;
    prompt: IFuncPrompt;
    confirm: IFuncConfirm;

    promptPhone?: IFuncPrompt;
    promptOption?: IFuncPrompt;
}

export interface UbiQRCodeResult {
    serial: string,
    productId: string,
}


export interface UbiServerResponseError {
    desp?: string;
    errorCode?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UbiUtilsService {

    constructor(private commonConfigService: UbibotCommonConfigService,
        private ubiUserDisplayPipe: UbiUserDisplayPipe,
        private translate: TranslateService,
        @Optional() @Inject(UBIBOT_UTILS_DIALOG_AGENT) private utilsDialogAgent: UbibotUtilsDialogAgent) {

        this.update();

        if (!utilsDialogAgent) {
            this.utilsDialogAgent = {
                alert: (...args) => {
                    console.log(args);
                    return Promise.resolve();
                },
                error: (...args) => {
                    console.warn(args);
                    return Promise.resolve();
                },
                showLoading: () => {
                    console.warn('IFuncShowLoading not implemented yet!');
                    return Promise.resolve();
                },
                hideLoading: () => {
                    console.warn('IFuncHideLoading not implemented yet!');
                    return Promise.resolve();
                },
                snack: (...args) => {
                    console.log(args);
                    return Promise.resolve();
                },
                confirm: (...args) => Promise.resolve(),
                prompt: (...args) => Promise.resolve(),
            };
        }
    }

    update(newAgent?: string) {
        console.log('Updating with new config UCM - UbiUtilsService...');

        if (newAgent) {
            this.commonConfigService.DeployAgent = newAgent;
        }
        this.commonConfigService.update();
    }

    // 因为会update agent，必须使用动态获取
    private getStorageKeyLanguage() {
        return `appLanguage-${this.commonConfigService.DeployAgent}`;
    }

    // 因为会update agent，必须使用动态获取
    private getStorageKeyProductProfileCache() {
        return `productProfileCache-${this.commonConfigService.DeployAgent}`;
    }

    // 因为会update agent，必须使用动态获取
    private getStorageKeyLastLogin() {
        return `last_login_username-${this.commonConfigService.DeployAgent}`;
    }

    // 因为会update agent，必须使用动态获取
    private getStorageKeyCurrentAgent() {
        return `currentAgent`;
    }

    // saveReportLocal(report: UbiReport) {
    //
    // }

    resetLanguage(preferred?: string) {
        // const lang = this.commonConfigService.PreferredLanguage;
        // this.translate.use(lang);
        // this.saveLanguage();

        const defaultLang = this.commonConfigService.DefaultLanguage;
        this.translate.setDefaultLang(defaultLang);
        console.log(`Setting default lang to ${defaultLang}`);

        // TODO: 以后有支持更多语言后会switch细分
        const browserLang = window.navigator.language === 'zh-CN' ? 'zh-CN' : 'en-GB';

        // 如果是第一次开启app，一般不会有preferred，这时取browserLang
        let lang = preferred || browserLang || this.getLanguage();
        this.useLang(lang);
    }

    useLang(lang: string) {
        this.translate.use(lang);
        // 不使用translate的subsribe，因为存在一种情况是agent改变了但language没有改变，
        // 而lang的key是跟agent挂钩的，这样lang没改变会导致没法触发translate的lange change subscribe
        // 从而没有将lang保存到对应的storage key上
        this.saveLanguage(lang);
        console.log(`Setting current lang to ${lang}`);
    }

    saveLanguage(langKey?: string) {
        if (langKey) {
            localStorage.setItem(this.getStorageKeyLanguage(), langKey);
        } else {
            localStorage.removeItem(this.getStorageKeyLanguage());
        }
    }

    setKeyValue(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    getKeyValue(key: string): string {
        return localStorage.getItem(key);
    }

    clearLocalStorage(): void {
        localStorage.clear();
    }

    /**
     * Get last set language. If null, return config's default.
     */
    getLanguage() {
        return localStorage.getItem(this.getStorageKeyLanguage()) || this.commonConfigService.PreferredLanguage;
    }

    saveProductProfileCache(item) {
        if (typeof item == 'object') {
            localStorage.setItem(this.getStorageKeyProductProfileCache(), JSON.stringify(item));
        }
    }

    getProductProfileCache() {
        let ret = {};
        let tmp = localStorage.getItem(this.getStorageKeyProductProfileCache());
        try {
            ret = JSON.parse(tmp);
        } catch (e) {
        }
        return ret;
    }

    saveLastLogin(saveKey?: string) {
        if (saveKey) {
            localStorage.setItem(this.getStorageKeyLastLogin(), saveKey);
        } else {
            localStorage.removeItem(this.getStorageKeyLastLogin());
        }
    }

    saveCurrentAgent() {
        const agent = this.commonConfigService.DeployAgent;
        localStorage.setItem(this.getStorageKeyCurrentAgent(), agent);
    }


    /**
     * 如果没有会返回null
     *
     * @returns {string}
     * @memberof UbiUtilsService
     */
    getLastAgent(): string {
        return localStorage.getItem(this.getStorageKeyCurrentAgent());
    }

    getLastLogin() {
        return localStorage.getItem(this.getStorageKeyLastLogin()) || '';
    }

    parseQRCode(input: string): UbiQRCodeResult {
        let serial;
        let productId;

        if (input) {
            const segs = _.compact(input.split(' '));
            if (segs.length > 1) {
                serial = segs[0];
                productId = segs[1];
            } else if (segs.length === 1) {
                serial = segs[0];

                if (this.commonConfigService.isServeCN()) {
                    productId = EnumBasicProductId.WS1_CN;
                } else {
                    productId = EnumBasicProductId.WS1;
                }
            }
        }

        return {
            serial: serial,
            productId: productId,
        };
    }

    parseError(err: Error, argsObj?: any): string {
        let ret = 'Unknown Error';

        if (err && !(err instanceof UbiError) && err.name == 'HttpErrorResponse') {
            if (err && (<any>err).error) {
                let ubiServerError: UbiServerResponseError = (<any>err).error;

                if (new RegExp(_.escapeRegExp('Wrong username or password'), 'i').test(ubiServerError.desp)
                    || new RegExp(_.escapeRegExp('Wrong username/email or password'), 'i').test(ubiServerError.desp)) {

                    ret = `${this.parseError(new UbiError(EnumAppError.USERNAME_OR_PASSWORD_ERROR))}`;
                } else if (ubiServerError.errorCode == 'device_attached_by_other_user') {
                    let owner = (<any>ubiServerError).owner;
                    ret = `${this.parseError(new UbiError(EnumAppError.DEVICE_ATTACHED_BY_OTHERS,
                        { account: this.ubiUserDisplayPipe.transform(owner) }))}`;
                } else if (ubiServerError.errorCode == 'invalid_activation_code') {
                    ret = `${this.parseError(new UbiError(EnumAppError.INVALID_ACTIVATION_CODE))}`;
                } else {
                    ret = `server: ${ubiServerError.desp}`;
                }
            } else {
                ret = this.parseError(new UbiError(EnumAppError.NETWORK_ERROR));
            }
        }

        if (err instanceof UbiError) {
            ret = this.translate.instant(`ERROR.${err.message}`, err.params || argsObj);
            ret = `${err.message} - ${ret}`;
        }

        return ret;
    }

    parseBoolean(b: string): boolean {
        let ret: boolean = null;
        if (b == 'true') {
            ret = true;
        } else if (b == 'false') {
            ret = false;
        }
        return ret;
    }

    detectProductFamily(productId: string): EnumBasicProductId {
        try {
            let uniformed = productId.toLowerCase().replace(/-cn/, '');
            if (/ws1$/.test(uniformed)) {
                return EnumBasicProductId.WS1;
            } else if (/ws1p$/.test(uniformed)) {
                return EnumBasicProductId.WS1P;
            }

        } catch (e) {
        }

        return null;
    }

    /**
     * SHA-256
     * 直接加到ubibot的通用库,不用dep
     * @param data
     */
    sha256(data): string {
        // const uint8array = new TextEncoder().encode(data);
        // var string = new TextDecoder().decode(uint8array);
        let ret = SHA2_256(data);
        return ret;
    }

    showLoading(msg): Promise<any> {
        return this.utilsDialogAgent.showLoading(msg);
    }

    hideLoading(): Promise<any> {
        return this.utilsDialogAgent.hideLoading();
    }

    brewErrorString(errInfo: string, level: string): string {
        return `${level}: ${errInfo}`;
    }

    error(err, ...argsObj): void {
        let errMsg = '';
        let errInfo = '';

        // console.log(err);
        // (<any>window).a = err;

        let msgShow;

        if (err && err.name == 'HttpErrorResponse') {
            errInfo = `${this.parseError(err)}`;
            // msgShow = `Error: ${errInfo}`;
            msgShow = this.brewErrorString(errInfo, 'Error');
        } else if (typeof err == 'string') {
            msgShow = `${err}`;
        } else if (err instanceof UbiError) {
            errInfo = `${this.parseError(err, argsObj)}`;
            // msgShow = `Error: ${errInfo}`;
            msgShow = this.brewErrorString(errInfo, 'Error');
        } else {
            try {
                errMsg = `Low-level exception`;
                errInfo = `${err.message}`;
            } catch (e) {
                errMsg = 'Cannot parse error message. More info in console.';
                console.error(e);
            }

            // msgShow = `${errMsg}, ${errInfo}`;
            msgShow = this.brewErrorString(errInfo, errMsg);
        }

        this.utilsDialogAgent.error(msgShow).then(() => null);
    }

    alert(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.alert(msg, opts);
    }

    snack(msg: string): Promise<any> {
        return this.utilsDialogAgent.snack(msg);
    }

    prompt(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.prompt(msg, opts);
    }

    promptPhone(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.promptPhone(msg, opts);
    }

    promptOption(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.promptOption(msg, opts);
    }

    confirm(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.confirm(msg, opts);
    }

    ToUTF8Array(str: string): Uint8Array {
        return ToUTF8Array(str);
    }

    FromUTF8Array(resp): string {
        return FromUTF8Array(resp);
    }

    async delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateUuid(): string {
        return `ubi-${uuid.v4()}`;
    }

    private toUbibotSSID(serial: string): string {
        try {
            const end = Math.min(serial.length, 5);
            const code = (serial.slice(0, end) || '').toUpperCase();
            return `Ubibot-${code}`;
        } catch (e) {
            return null;
        }
    }

    private toDuduSSID(serial: string): string {
        try {
            const end = Math.min(serial.length, 4);
            const code = (serial.slice(0, end) || '').toUpperCase();
            return `DuDu-${code}`;
        } catch (e) {
            return null;
        }
    }

    containsSpaceOrLineBreak(str: string): boolean {
        return /[\s\n\r]/.test(str);
    }

    predictDeviceSSID(serial: string): string {
        if (/^cctv/i.test(serial)) {
            return this.toDuduSSID(serial);
        } else {
            return this.toUbibotSSID(serial);
        }
    }
}
