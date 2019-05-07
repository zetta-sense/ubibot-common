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
        this.resetLanguages();

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });
    }

    resetLanguages(preferred?: string) {
        const defaultLang = this.commonConfigService.DefaultLanguage;
        this.translate.setDefaultLang(defaultLang);
        console.log(`Setting default lang to ${defaultLang}`);

        let lang = preferred || this.ubiUtils.getLanguage();
        this.translate.use(lang);
        console.log(`Setting current lang to ${lang}`);
    }

    public getAllLanguages() {
        return _.concat([], this.EnumLanguages);
    }

    ngOnDestroy(): void {

    }
}
