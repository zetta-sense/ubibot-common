import {Injectable, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';
import {UbiUtilsService} from './ubi-utils.service';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class UbiLocalizeService implements OnDestroy {// tag: 特别注意service只有OnDestroy的lifecycle event
    EnumLanguages: Array<any>;

    constructor(private translate: TranslateService,
                private titleService: Title,
                private commonConfigService: UbibotCommonConfigService,
                private ubiUtils: UbiUtilsService) {

        this.EnumLanguages = [
            {key: 'en-GB', label: 'English'},
            {key: 'zh-CN', label: '中文(简体)'},
            {key: 'ja-JP', label: '日本語'}
        ];

        const defaultLang = this.commonConfigService.DefaultLanguage;
        this.translate.setDefaultLang(defaultLang);
        console.log(`Setting default lang to ${defaultLang}`);

        let lang = this.ubiUtils.getLanguage();
        this.translate.use(lang);
        console.log(`Setting current lang to ${lang}`);

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });
    }

    public getAllLanguages() {
        return _.concat([], this.EnumLanguages);
    }

    ngOnDestroy(): void {

    }
}
