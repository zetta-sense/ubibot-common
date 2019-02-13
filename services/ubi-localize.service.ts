import {Injectable, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {AppConfigService} from '../providers/app-config.service';
import {UbiUtilsService} from './ubi-utils.service';

@Injectable({
    providedIn: 'root'
})
export class UbiLocalizeService implements OnDestroy {// tag: 特别注意service只有OnDestroy的lifecycle event
    EnumLanguages: Array<any>;

    constructor(private translate: TranslateService,
                private titleService: Title,
                private appConfig: AppConfigService,
                private ubiUtils: UbiUtilsService) {

        this.EnumLanguages = [
            {key: 'en-GB', label: 'English'},
            {key: 'zh-CN', label: '中文(简体)'},
            {key: 'ja-JP', label: '日本語'}
        ];

        const defaultLang = this.appConfig.DefaultLanguage;
        this.translate.setDefaultLang(defaultLang);
        console.log(`Setting default lang to ${defaultLang}`);

        let lang = this.ubiUtils.getLanguage();
        this.translate.use(lang);

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });
    }

    ngOnDestroy(): void {

    }
}
