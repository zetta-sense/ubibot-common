import {Pipe, PipeTransform} from '@angular/core';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';

/**
 * Generated class for the ResourceUrlPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
    name: 'resourceUrl',
})
export class ResourceUrlPipe implements PipeTransform {
    constructor(private ubibotCommonConfig: UbibotCommonConfigService) {
        // console.log('ResourceUrlPipe init...');
    }

    /**
     * Takes a value and makes it lowercase.
     */
    transform(input: string, size: number = 32, useLogoIfEmpty: boolean = true) {
        try {
            if (input && input.length) {
                let url = `${this.ubibotCommonConfig.EndPoint}/images/resize?url=${input}&w=${size}&h=${size}`;
                // let url = "assets/imgs/img-empty.png";
                return url;
            } else {
                return useLogoIfEmpty ? this.ubibotCommonConfig.LogoFile : "assets/img-empty.png";
            }
        } catch (e) {
        }
        return input;
    }
}
