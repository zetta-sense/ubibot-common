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
import { UbiDataChartSerie, UbiDataChartPoint } from '../core/components/ubi-data-chart/ubi-data-chart.component';
import { UbiFeedsResponse, UbiFeedType } from '../remote/remote-channel.service';
import { UbiChannelDAO, ConvertValue, UbiValueOptions, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiChannelFieldDef, UbiChannelFieldDefScaleType } from '../entities/ubi-channel-field-def.entity';
import { UbiEventService } from './ubi-event.service';
import { UbiLanguageDef, UbibotSupportedLanguagesService } from '../providers/ubibot-supported-languages.service';
import { UbiStorageService } from './ubi-storage.service';
import { UbiFeedsConverterEngine, UbiFeedPack } from './base/ubi-feeds-converter.engine';

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
    promptEmail?: IFuncPrompt;
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

    private feedsConverterEngine: UbiFeedsConverterEngine = new UbiFeedsConverterEngine();

    constructor(
        private commonConfigService: UbibotCommonConfigService,
        private ubiSupportedLanguages: UbibotSupportedLanguagesService,
        private ubiUserDisplayPipe: UbiUserDisplayPipe,
        private ubiStorage: UbiStorageService,
        private translate: TranslateService,
        private ubiEvent: UbiEventService,
        @Optional() @Inject(UBIBOT_UTILS_DIALOG_AGENT) private utilsDialogAgent: UbibotUtilsDialogAgent
    ) {

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


    /**
     * 更新及保存当前agent
     *
     * @param {string} [newAgent]
     * @memberof UbiUtilsService
     */
    update(newAgent?: string) {
        console.log(`Updating with new config UCM - UbiUtilsService...${newAgent}`);

        if (newAgent) {
            this.commonConfigService.DeployAgent = newAgent;
            this.saveCurrentAgent();
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

    private getStorageKeyCurrentAgent() {
        return `currentAgent`;
    }

    private getStorageKeyJPushToken() {
        return `last_jpush_token`;
    }

    private getStorageKeyFCMToken() {
        return `last_fcm_token`;
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
        // console.log(`preferred=${preferred}, getLanguage=${this.getLanguage()}`);
        const browserLang = window.navigator.language === 'zh-CN' ? 'zh-CN' : 'en-GB';

        // 如果是第一次开启app，一般不会有preferred也不应有保存了的language，这时取browserLang
        let lang = preferred || this.getLanguage() || browserLang;
        this.useLang(lang);
    }

    useLang(lang: string) {
        this.translate.use(lang);
        // 不使用translate的subscribe，因为存在一种情况是agent改变了但language没有改变，
        // 而lang的key是跟agent挂钩的，这样lang没改变会导致没法触发translate的lange change subscribe
        // 从而没有将lang保存到对应的storage key上
        this.saveLanguage(lang);

        this.ubiEvent.broadcast(EnumAppConstant.EVENT_UBI_CHANGE_LANGUAGE, lang);

        console.log(`Setting current lang to ${lang}`);
    }

    saveLanguage(langKey?: string) {
        if (langKey) {
            console.log(`Save ${langKey} to ${this.getStorageKeyLanguage()}`);
            this.ubiStorage.save(this.getStorageKeyLanguage(), langKey);
        } else {
            this.ubiStorage.remove(this.getStorageKeyLanguage());
        }
    }

    setKeyValue(key: string, value: string) {
        this.ubiStorage.save(key, value);
    }

    getKeyValue(key: string): string {
        return this.ubiStorage.get(key);
    }

    clearLocalStorage(): void {
        this.ubiStorage.clear();
    }

    /**
     * Get last set language. If null, return config's default.
     */
    getLanguage() {
        // console.log('Retrieve lang key:', this.getStorageKeyLanguage());
        return this.ubiStorage.get(this.getStorageKeyLanguage()) || this.commonConfigService.PreferredLanguage;
    }

    /**
     * 返回一个当前lang的完整定义，包括key, label
     * 详见UbiLnaguageDef
     *
     * @returns
     * @memberof UbiUtilsService
     */
    getLanguageDef() {
        const language = this.getLanguage();
        return _.find(this.ubiSupportedLanguages.getLanguages(), { key: language });
    }

    saveProductProfileCache(item) {
        if (typeof item == 'object') {
            this.ubiStorage.save(this.getStorageKeyProductProfileCache(), JSON.stringify(item));
        }
    }

    getProductProfileCache() {
        let ret = {};
        let tmp = this.ubiStorage.get(this.getStorageKeyProductProfileCache());
        try {
            ret = JSON.parse(tmp);
        } catch (e) {
        }
        return ret;
    }

    saveLastLogin(saveKey?: string) {
        if (saveKey) {
            this.ubiStorage.save(this.getStorageKeyLastLogin(), saveKey);
        } else {
            this.ubiStorage.remove(this.getStorageKeyLastLogin());
        }
    }

    saveCurrentAgent() {
        const agent = this.commonConfigService.DeployAgent;
        this.ubiStorage.save(this.getStorageKeyCurrentAgent(), agent);
    }


    saveLastJPushToken(token: string): void {
        if (token) {
            this.ubiStorage.save(this.getStorageKeyJPushToken(), token);
        }
    }

    removeLastJPushToken(): void {
        this.ubiStorage.remove(this.getStorageKeyJPushToken());
    }

    saveLastFCMToken(token: string): void {
        if (token) {
            this.ubiStorage.save(this.getStorageKeyFCMToken(), token);
        }
    }

    removeLastFCMToken(): void {
        this.ubiStorage.remove(this.getStorageKeyFCMToken());
    }

    getLastJPushToken(): string {
        return this.ubiStorage.get(this.getStorageKeyJPushToken());
    }

    getLastFCMToken(): string {
        return this.ubiStorage.get(this.getStorageKeyFCMToken());
    }


    /**
     * 如果没有会返回null
     *
     * @returns {string}
     * @memberof UbiUtilsService
     */
    getLastAgent(): string {
        return this.ubiStorage.get(this.getStorageKeyCurrentAgent());
    }

    getLastLogin() {
        return this.ubiStorage.get(this.getStorageKeyLastLogin()) || '';
    }


    /**
     * 对有product id和无product id的序列号进行统一
     *
     * @param {string} input
     * @returns {UbiQRCodeResult}
     * @memberof UbiUtilsService
     */
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

    isValidSerial(serial: string): boolean {
        if (!serial) return false;
        const hasInvalidChar = /[:/]/.test(serial);
        return !hasInvalidChar;
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
                } else if (ubiServerError.errorCode == 'username_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.USERNAME_EXISTED))}`;
                } else if (ubiServerError.errorCode == 'email_address_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.EMAIL_EXISTED))}`;
                } else if (ubiServerError.errorCode == 'mobile_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.MOBILE_EXISTED))}`;
                } else if (ubiServerError.errorCode == 'request_too_fast'
                    && ubiServerError.desp == 'please wait another 60 seconds') {
                    ret = `${this.parseError(new UbiError(EnumAppError.SEND_SMS_CODE_COOLDOWN))}`;
                } else if (ubiServerError.errorCode == 'invalid_code'
                    && ubiServerError.desp == 'sms_code is not correct') {
                    ret = `${this.parseError(new UbiError(EnumAppError.INVALID_SMS_CODE))}`;
                } else if (ubiServerError.errorCode == 'permission_denied'
                    && ubiServerError.desp == 'invalid user_id or password') {
                    ret = `${this.parseError(new UbiError(EnumAppError.USERNAME_OR_PASSWORD_ERROR))}`;
                } else if (ubiServerError.errorCode == 'permission_denied'
                    && ubiServerError.desp == 'You can not share channels to yourself') {
                    ret = `${this.parseError(new UbiError(EnumAppError.INVALID_SHARE_SELF))}`;
                } else if (ubiServerError.errorCode == 'permission_denied'
                    && ubiServerError.desp == 'Incorrect email_code') {
                    ret = `${this.parseError(new UbiError(EnumAppError.INVALID_EMAIL_CODE))}`;
                } else if (ubiServerError.errorCode == null) {
                    ret = `${this.parseError(new UbiError(EnumAppError.SOMETHING_WRONG_WITH_MOBILE))}`;
                } else {
                    ret = `server: ${ubiServerError.desp}`;
                }
            } else {
                ret = this.parseError(new UbiError(EnumAppError.NETWORK_ERROR));
            }
        } else if (err instanceof UbiError) {
            ret = this.translate.instant(`ERROR.${err.message}`, err.params || argsObj);
            ret = `${err.message} - ${ret}`;
        } else if (err) {
            if (err.message) {
                ret = `${ret}: ${err.message}`;
            } else if (typeof err === 'string') {
                ret = `${ret}: ${err}`;
            }
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
                errInfo = `${err.message || err.desp}`; // UploadService的错误返回原请求错误,服务器错误内含desp

                console.error(err);
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

    promptEmail(msg: string, opts: any = {}): Promise<any> {
        return this.utilsDialogAgent.promptEmail(msg, opts);
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

    predictDeviceBleName(serial: string, productId: string): string {
        let ret: string;
        if (productId === EnumBasicProductId.URBAN_IS1) {
            // Intlite - IS1 - XXXXX
            const part1 = 'Intlite-IS1';
            const part2 = serial.substring(0, 5);
            ret = `${part1}-${part2}`;
        } else if (productId === EnumBasicProductId.URBAN_IT1) {
            const part1 = 'Intlite-IT1';
            const part2 = serial.substring(0, 5);
            ret = `${part1}-${part2}`;
        } else if (productId === EnumBasicProductId.URBAN_MS1) {
            const part1 = 'Intlite-MS1';
            const part2 = serial.substring(0, 5);
            ret = `${part1}-${part2}`;
        } else if (UbiChannel.IsFamilyUbibot(productId) || UbiChannel.IsFamilyUrban(productId)) {
            // 默认蓝牙构成方式，首字母大写，接-后的
            try {
                const productIdLowerCase = productId.toLowerCase();
                let part1 = productIdLowerCase.slice(0, productIdLowerCase.indexOf('-'));
                let part2 = productIdLowerCase.slice(productIdLowerCase.indexOf('-') + 1);
                part1 = part1.charAt(0).toUpperCase() + part1.slice(1);
                part2 = part2.toUpperCase();

                let part3 = serial.substring(0, 5);
                ret = `${part1}-${part2}-${part3}`;
            } catch (e) {
                ret = `CAN NOT RECOGNIZE - ${productId}`;
            }
        }
        return ret;
    }

    predictDeviceBlePassword(serial: string, productId: string): string {
        let ret: string;
        if (UbiChannel.IsFamilyUrban(productId)) {
            ret = serial.slice(1, 5);
        } else if (UbiChannel.IsFamilyMS1(productId)) {
            ret = serial.slice(1, 5);
        }
        return ret;
    }

    /**
     * 单serie解包
     *
     * @param {UbiFeedsResponse} resp
     * @returns {UbiFeedPack[]}
     * @memberof UbiUtilsService
     */
    extractFeeds(resp: UbiFeedsResponse, opts?: UbiValueOptions, type?: UbiFeedType): UbiFeedPack[] {
        let packArray = this.feedsConverterEngine.extractFeeds(resp, opts, type);

        // console.log(packArray);

        return packArray;
    }



}


// empty as null
export let _EAN_ = function strEmptyAsNull<T>(input: T): T {
    /*
     * empty, nan, null, undefined will return null
     * 0 and others return raw input
     */

    if (typeof input === 'number' && input == 0) {
        return input;
    }

    return !input ? null : input;
};

// number fix
// ref: https://stackoverflow.com/questions/3612744/remove-insignificant-trailing-zeros-from-a-number
// ref: https://stackoverflow.com/questions/12227594/which-is-better-numberx-or-parsefloatx/13676265#13676265
export let _NF_ = function fixNumber(input: number, decimalPlace: number): string {
    try {
        if (decimalPlace === -1) {
            return `${input}`;
        } else if (decimalPlace === -2) {
            return `${Number(input.toFixed(2))}`;
        }
        return input.toFixed(decimalPlace);
    } catch (e) { }
    return `${input}`;
};
