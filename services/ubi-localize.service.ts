import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { UbiUtilsService } from './ubi-utils.service';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class UbiLocalizeService implements OnDestroy {// tag: 特别注意service只有OnDestroy的lifecycle event
    EnumLanguages: Array<any> = [
        { key: 'en-GB', label: 'English' },
        { key: 'zh-CN', label: '中文(简体)' },
        { key: 'ja-JP', label: '日本語' }
    ];

    constructor(
        private translate: TranslateService,
        private titleService: Title,
        private commonConfigService: UbibotCommonConfigService,
        private ubiUtils: UbiUtilsService
    ) {
        // 默认情况下使用用户上次使用的语言
        this.resetLanguages(this.ubiUtils.getLanguage());

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });

        this.translate.onLangChange.subscribe((data) => {
            this.ubiUtils.saveLanguage(data.lang);
        });
    }

    resetLanguages(preferred?: string) {
        const defaultLang = this.commonConfigService.DefaultLanguage;
        this.translate.setDefaultLang(defaultLang);
        console.log(`Setting default lang to ${defaultLang}`);

        // TODO: 以后有支持更多语言后会switch细分
        const browserLang = window.navigator.language === 'zh-CN' ? 'zh-CN' : 'en-GB';

        // 如果是第一次开启app，一般不会有preferred，这时取browserLang
        let lang = preferred || browserLang || this.ubiUtils.getLanguage();
        this.useLang(lang);
    }

    useLang(lang: string) {
        this.translate.use(lang);
        console.log(`Setting current lang to ${lang}`);
    }

    public getAllLanguages() {
        return _.concat([], this.EnumLanguages);
    }

    ngOnDestroy(): void {

    }
}
