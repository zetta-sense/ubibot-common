import {Pipe, PipeTransform, InjectionToken, Inject, Optional} from '@angular/core';
import { UbibotCommonConfigService } from '../../providers/ubibot-common-config.service';

export const UBIBOT_RESOURCE_URL_CONFIG = new InjectionToken<UbibotResourceUrilConfig>('UBIBOT_RESOURCE_URL_CONFIG');
export interface UbibotResourceUrilConfig {
    defaultEmptyFile?: string;
    defaultLogoFile?: string;
}

/**
 * Generated class for the ResourceUrlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'resourceUrlV2',
})
export class ResourceUrlV2Pipe implements PipeTransform {
    constructor(private ubibotCommonConfig: UbibotCommonConfigService,
        @Optional() @Inject(UBIBOT_RESOURCE_URL_CONFIG) private config: UbibotResourceUrilConfig) {
        // console.log('ResourceUrlPipe init...');

        if(!config) {
            this.config = {
                defaultEmptyFile: 'assets/img-empty.png',
                defaultLogoFile: 'assets/logo.png',
            };
        }
    }

    /**
     * Input is asuumed to be channel_icon.
     *
     * @param {string} input
     * @param {number} [size=32]
     * @param {boolean} [useLogoIfEmpty=true]
     * @returns
     * @memberof ResourceUrlV2Pipe
     */
    transform(input: string, size: number = 32, useLogoIfEmpty: boolean = true) {
        try {
            if (input && input.length) {
                // let url = `${input}`;//&x-oss-process=image/resize,w_${size},h_${size},limit_0
                let url = `${input}?x-oss-process=image/resize,w_${size},h_${size},limit_0,m_pad`;
                return url;
            } else {
                let { defaultEmptyFile, defaultLogoFile} = this.config;

                // 优先配置文件，因为配置文件可以通过build脚本更新
                return useLogoIfEmpty ? (this.ubibotCommonConfig.LogoFile || defaultLogoFile) : defaultEmptyFile;
            }
        } catch (e) {
        }
        return input;
    }
}
