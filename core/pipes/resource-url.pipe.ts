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
    name: 'resourceUrl',
})
export class ResourceUrlPipe implements PipeTransform {
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
     * Takes a value and makes it lowercase.
     */
    transform(input: string, size: number = 32, useLogoIfEmpty: boolean = true) {
        try {
            if (input && input.length) {
                let url = `${this.ubibotCommonConfig.EndPoint}/images/resize?url=${input}&w=${size}&h=${size}`;
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
