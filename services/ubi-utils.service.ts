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
import { UbiChannelDAO, ConvertValue, UbiValueOptions } from '../entities/ubi-channel.entity';
import { UbiChannelFieldDef } from '../entities/ubi-channel-field-def.entity';
import { UbiEventService } from './ubi-event.service';
import { UbiLanguageDef, UbibotSupportedLanguagesService } from '../providers/ubibot-supported-languages.service';
import { UbiStorageService } from './ubi-storage.service';

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


export interface UbiFeedPack {
    key: string, // field1, ...
    title: string,
    field: UbiChannelFieldDef,
    series: UbiDataChartSerie[],

    feedType: UbiFeedType,

    maxPoint?: UbiDataChartPoint,
    minPoint?: UbiDataChartPoint,

    avg?: number,
    sum?: number,

    start: Date, // 整个resp数据的开始日期
    end: Date,  // 整个resp数据的结束日期
}


@Injectable({
    providedIn: 'root'
})
export class UbiUtilsService {

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
                } else if (ubiServerError.errorCode == 'username_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.USERNAME_EXISTED))}`;
                } else if (ubiServerError.errorCode == 'email_address_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.EMAIL_EXISTED))}`;
                } else if (ubiServerError.errorCode == 'mobile_exist') {
                    ret = `${this.parseError(new UbiError(EnumAppError.MOBILE_EXISTED))}`;
                }  else if (ubiServerError.errorCode == 'request_too_fast'
                    && ubiServerError.desp == 'please wait another 60 seconds') {
                    ret = `${this.parseError(new UbiError(EnumAppError.SEND_SMS_CODE_COOLDOWN))}`;
                } else if (ubiServerError.errorCode == 'invalid_code'
                    && ubiServerError.desp == 'sms_code is not correct') {
                    ret = `${this.parseError(new UbiError(EnumAppError.INVALID_SMS_CODE))}`;
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
        if (productId === EnumBasicProductId.SP1) {
            // Ubibot - SP1 - XXXXX
            // 序列号前5位
            const part1 = 'Ubibot-SP1'; // MDPS-
            const part2 = serial.substring(0, 5);
            ret = `${part1}-${part2}`;
            // ret = 'MDPS-1016';
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
        const channel: UbiChannelDAO = new UbiChannelDAO(resp.channel);
        const fields: UbiChannelFieldDef[] = channel.getFields().getEnabledFieldDefs()

        // 追加头尾两端的端点
        // tag: 必须要转换为number, 如果是string, 可能由于带有zone time的关系导致比较错误
        const start: number = new Date(resp.start).getTime();
        const end: number = new Date(resp.end).getTime();

        const map: { [key: string]: UbiFeedPack } = {};

        // 构建每个field的pack
        for (let i = 0; i < fields.length; i++) {
            const field: UbiChannelFieldDef = fields[i];
            const fieldKey = field.key;
            const fieldName = field.label;

            const data: UbiDataChartPoint[] = [];

            // tag: mock data to debug
            // resp.feeds = [
            //     { created_at: '2019-05-22T21:30:39+08:00', field1: 1 },
            //     { created_at: '2019-05-22T21:30:39+08:05', field1: 2.1 },
            //     { created_at: '2019-05-22T21:30:39+08:09', field1: 1.4 },
            //     { created_at: '2019-05-22T21:30:39+08:15', field1: 1.8 },
            // ];

            const serie_1: UbiDataChartSerie = {
                name: fieldKey,
                label: fieldName,
                data: data,
            };

            map[fieldKey] = {
                key: fieldKey,
                field: field,
                title: fieldName,
                series: [serie_1],
                start: new Date(start),
                end: new Date(end),

                feedType: type || UbiFeedType.Sampling,
            };
        }

        // 归纳数据
        for (let i = 0; i < resp.feeds.length; i++) {
            const feed = resp.feeds[i];
            const keys: string[] = _.keys(feed);

            const createdAt: string = feed.created_at;
            keys.forEach((k) => {
                const pack: UbiFeedPack = map[k];

                // 不使用正则尽量提高performance
                if (pack && 'created_at' !== k) {
                    const value = ConvertValue(feed[k], pack.field, opts);
                    const point: UbiDataChartPoint = { x: new Date(createdAt).getTime(), y: value };
                    pack.series[0].data.push(point);
                }
            });
        }

        // 排序 / 找出最大最小值 / 计算平均值
        const ret: UbiFeedPack[] = _.values(map);
        for (let i = 0; i < ret.length; i++) {
            const pack = ret[i];
            const data = pack.series[0].data;

            // asc sort
            data.sort((a, b) => a.x - b.x);

            const first = _.first(data);
            // console.log(!!start, !_.find(data, { x: start }), (!first || first.x > start));
            if (!isNaN(start) && !_.find(data, { x: start }) && (!first || first.x > start) && data.length) {
                // console.log('adding first point');
                data.unshift({ x: start, y: null });
            }

            const last = _.last(data);
            if (!isNaN(end) && !_.find(data, { x: end }) && (!last || last.x < end) && data.length) {
                // console.log('adding last point');
                data.push({ x: end, y: null });
            }


            const dataFiltered = _.filter(data, (o: UbiDataChartPoint) => o.y != null); // 去除y空值点
            const maxPoint = _.maxBy(dataFiltered, (o: UbiDataChartPoint) => o.y);
            const minPoint = _.minBy(dataFiltered, (o: UbiDataChartPoint) => o.y);
            pack.maxPoint = maxPoint;
            pack.minPoint = minPoint;
            const sum = dataFiltered.length ? _.reduce(dataFiltered, (sum: number, o: UbiDataChartPoint) => sum + o.y, 0) : null;
            const avg = dataFiltered.length ? sum / dataFiltered.length : null;
            pack.sum = sum;
            pack.avg = avg;
        }

        return ret;
    }
}
