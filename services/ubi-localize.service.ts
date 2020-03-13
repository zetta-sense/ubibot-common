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
    EnumLanguages: Array<any>;

    constructor(
        private translate: TranslateService,
        private titleService: Title,
        private commonConfigService: UbibotCommonConfigService,
        private ubiUtils: UbiUtilsService
    ) {
        this.EnumLanguages = this.ubiUtils.getLanguageDef();

        // 默认情况下使用用户上次使用的语言
        // 正常情况下的启动流程:
        // agentKey = deploy agent(第一次启动) / last agent(除第一次外)
        // -> save lang (in agentKey), 这时一般是browser lang，因此可能出现 -cn = en-gb
        // -> determine server (newAgent)
        // -> reset lang (根据newAgent对准lang)
        // -> save lang (这时将lang save到新的agent)
        // console.log('fak?', this.ubiUtils.getLanguage())
        this.resetLanguage();

        this.translate.onDefaultLangChange.subscribe(() => {
            // this.updateAppTitle();
        });

        // 不使用translate的subsribe，因为存在一种情况是agent改变了但language没有改变，
        // 而lang的key是跟agent挂钩的，这样lang没改变会导致没法触发translate的lange change subscribe
        // 从而没有将lang保存到对应的storage key上
        // this.translate.onLangChange.subscribe((data) => {
        //     console.log('lang changed');
        //     this.ubiUtils.saveLanguage(data.lang);
        // });
    }

    resetLanguage(preferred?: string) {
        // const defaultLang = this.commonConfigService.DefaultLanguage;
        // this.translate.setDefaultLang(defaultLang);
        // console.log(`Setting default lang to ${defaultLang}`);

        // // TODO: 以后有支持更多语言后会switch细分
        // const browserLang = window.navigator.language === 'zh-CN' ? 'zh-CN' : 'en-GB';

        // // 如果是第一次开启app，一般不会有preferred，这时取browserLang
        // let lang = preferred || browserLang || this.ubiUtils.getLanguage();
        // this.useLang(lang);

        this.ubiUtils.resetLanguage(preferred);
    }

    useLang(lang: string) {
        // this.translate.use(lang);
        // console.log(`Setting current lang to ${lang}`);

        this.ubiUtils.useLang(lang);
    }

    public getAllLanguages() {
        return _.concat([], this.EnumLanguages);
    }

    ngOnDestroy(): void {

    }
}
