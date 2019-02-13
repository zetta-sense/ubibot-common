import {Injectable, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {AppConfigService} from '../providers/app-config.service';
import {UbiUtilsService} from './ubi-utils.service';

@Injectable({
    providedIn: 'root'
})
export class UbiLocalizeService implements OnInit {
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

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });
    }

    ngOnInit() {
        this.translate.setDefaultLang(this.appConfig.DefaultLanguage);

        let lang = this.ubiUtils.getLanguage();
        this.translate.use(lang);
    }

}
