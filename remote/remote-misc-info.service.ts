import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UbiAPNListItem {
    label: string;
    params: {
        apn: string;
        user: string;
        pwd: string;
    }
}

export interface UbiAppVersionInfo {
    /**
     * 理应是sematic ver
     *
     * @type {string}
     * @memberof UbiAppVersionInfo
     */
    version: string;

    /**
     * 注意服务器使用\n换行，所以样式要用pre
     *
     * @type {string}
     * @memberof UbiAppVersionInfo
     */
    updateMessage: string;

    /**
     * 下载地址，目前用系统浏览器打开
     *
     * @type {string}
     * @memberof UbiAppVersionInfo
     */
    url: string;
}

@Injectable()
export class RemoteMiscInfoService {

    constructor(private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService) {
    }


    /**
     * Fetch apn item list.
     *
     * @returns {Observable<UbiAPNListItem[]>}
     * @memberof RemoteMiscInfoService
     */
    getAPNList(): Observable<UbiAPNListItem[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/get_mobile_apn_list`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return resp.apn_list;
            })
        );
    }


    getAppLatestVersionInfo(platform: 'android' | 'ios'): Observable<UbiAppVersionInfo> {
        // eg. http://api.ubibot.cn/ubibot-apps/latest-stable
        let url = `${this.ubibotCommonConfig.EndPoint}/ubibot-apps/latest-stable`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                //resp = {
                //    'android': {
                //        version: '1.1.99',
                //        updateMessage: '[1]新增视频弹幕功能\n[2]优化离线缓存功能\n[3]增强了稳定性',
                //        url: 'http://www.ubibot.cn/setup'
                //    },
                //    'ios': {
                //        version: '1.1.99',
                //        updateMessage: '[1]新增视频弹幕功能\n[2]优化离线缓存功能\n[3]增强了稳定性',
                //        url: 'https://itunes.apple.com/cn/app/%E8%BD%BB%E6%9D%BE%E8%BF%9E/id1237146577'
                //    }
                //};
                return platform === 'ios' ? resp.ios : resp.android;
            })
        );
    }
}
