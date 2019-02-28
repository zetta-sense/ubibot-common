import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';
import {EnumBasicProductId} from '../enums/enum-basic-product-id.enum';
import {EnumAppError} from '../enums/enum-app-error.enum';
import {TranslateService} from '@ngx-translate/core';
import {UbiError} from '../errors/UbiError';
import {EnumAppConstant} from '../enums/enum-app-constant.enum';
import * as _ from 'lodash';
import {UbiUserDisplayPipe} from '../pipes/ubi-user-display.pipe';
import * as uuid from 'uuid';
import {SHA2_256} from '../misc/sha256';
import {FromUTF8Array, ToUTF8Array} from '../misc/utf8arr';

export interface UbiServerResponseError {
    desp?: string;
    errorCode?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UbiUtilsService {

    storageKeyLanguage;
    storageKeyProductProfileCache;
    storageKeyLastLogin;

    constructor(private commonConfigService: UbibotCommonConfigService,
                private ubiUserDisplayPipe: UbiUserDisplayPipe,
                private translate: TranslateService) {
        console.log('Initializing UbibotCommonModule - UbiUtilsService...');

        this.storageKeyLanguage = `appLanguage-${this.commonConfigService.DeployAgent}`;
        this.storageKeyProductProfileCache = `productProfileCache-${this.commonConfigService.DeployAgent}`;
        this.storageKeyLastLogin = `last_login_username-${this.commonConfigService.DeployAgent}`;
    }

    // saveReportLocal(report: UbiReport) {
    //
    // }

    resetLanguage() {
        const lang = this.commonConfigService.PreferredLanguage;
        this.translate.use(lang);
        this.saveLanguage();
    }

    saveLanguage(langKey?: string) {
        if (langKey) {
            localStorage.setItem(this.storageKeyLanguage, langKey);
        } else {
            localStorage.removeItem(this.storageKeyLanguage);
        }
    }

    /**
     * Get last set language. If null, return config's default.
     */
    getLanguage() {
        return localStorage.getItem(this.storageKeyLanguage) || this.commonConfigService.PreferredLanguage;
    }

    saveProductProfileCache(item) {
        if (typeof item == 'object') {
            localStorage.setItem(this.storageKeyProductProfileCache, JSON.stringify(item));
        }
    }

    getProductProfileCache() {
        let ret = {};
        let tmp = localStorage.getItem(this.storageKeyProductProfileCache);
        try {
            ret = JSON.parse(tmp);
        } catch (e) {
        }
        return ret;
    }

    saveLastLogin(saveKey?: string) {
        if (saveKey) {
            localStorage.setItem(this.storageKeyLastLogin, saveKey);
        } else {
            localStorage.removeItem(this.storageKeyLastLogin);
        }
    }

    getLastLogin() {
        return localStorage.getItem(this.storageKeyLastLogin) || '';
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
                        {account: this.ubiUserDisplayPipe.transform(owner)}))}`;
                } else {
                    ret = `server: ${ubiServerError.desp}`;
                }
            } else {
                ret = this.parseError(new UbiError(EnumAppError.NETWORK_ERROR));
            }
        }

        if (err instanceof UbiError) {
            ret = this.translate.instant(`ERROR.${err.message}`, err.params || argsObj);
            ret = `${err.message}, ${ret}`;
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
}
