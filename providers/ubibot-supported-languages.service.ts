import { Injectable } from '@angular/core';
import * as _ from 'lodash';

export interface UbiLanguageDef {
    label: string;
    key: string;
}

/**
 * 仅用于统一枚举能使用的语言
 *
 * @export
 * @class UbibotSupportedLanguagesService
 */
@Injectable()
export class UbibotSupportedLanguagesService {
    constructor() {
        console.log('UbibotSupportedLanguagesService init...');
    }

    getLanguages(): UbiLanguageDef[] {
        return [{
            label: '中文简体',
            key: 'zh-CN',
        }, {
            label: 'English',
            key: 'en-GB',
        }, {
            label: '日本語',
            key: 'ja-JP',
        }];
    }


}
