import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UbiTimezoneMap } from '../entities/ubi-timezone.entify';
import { UbiProfileTable } from '../entities/ubi-profile-table.entity';

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

    /**
     * Get available timezones from ubicloud.
     *
     * http://api.ubibot.cn/constants/timezones
     *
     * @returns {Observable<UbiTimezoneMap>}
     * @memberof RemoteMiscInfoService
     */
    getTimezones(): Observable<UbiTimezoneMap> {
        let url = `${this.ubibotCommonConfig.EndPoint}/constants/timezones`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return <UbiTimezoneMap>resp.timezones;
            })
        );
    }

    /**
     * 返回products以及sensors的profiles
     *
     * ref: https://jira.cloudforce.cn/projects/UBIAPP2/issues/UBIAPP2-74?filter=allopenissues
     *
     * @returns {Observable<UbiProfileTable>}
     * @memberof RemoteMiscInfoService
     */
    getUbibotProfiles(): Observable<UbiProfileTable> {
        let url = `${this.ubibotCommonConfig.EndPoint}/configs/product-profiles/all`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                let ret = new UbiProfileTable(resp);
                return ret;
            }),
            // catchError((err) => {
            //     console.warn('Fetch product profile failed. Fall back to empty.');
            //     let ret: UbiProfileTable = new UbiProfileTable({});
            //     return of(ret);
            // }),
        );
    }


    /**
     * Search User by user or user_id
     *
     * To search user accounts, send an HTTP GET to http://api.datadudu.cn/accounts/search
     *
     * Valid request parameters:
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     * username (string) or user_id (string): (required) : search by username (minimum 3 characters needed)  or search by user_id, user_id must be full length and correct.
     *
     * @param {string} pattern
     * @returns {Observable<UbiSearchUserResultItem>}
     * @memberof RemoteMiscInfoService
     */
    searchUser(pattern: string): Observable<UbiSearchUserResultItem> {
        const url = `${this.ubibotCommonConfig.EndPoint}/accounts/search`;

        const params = {
            username: pattern,
        };

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => {
                return resp.users;
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

export interface UbiSearchUserResultItem {
    avatar: string;
    avatar_base: string;
    email: string;
    email_status: string;
    user_id: string;
    username: string;
}
