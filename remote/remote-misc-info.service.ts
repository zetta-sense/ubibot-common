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
        // let url = `https:/api.ubibot.io/configs/product-profiles/all`; // fixme: 暂时用io的作为debug
        return this.http.get(url).pipe(
            map((resp: any) => {
                // resp['product-profiles']['ubibot-gs1-a'] = {
                //     "slots-available": ["field1", "field2", "field3", "field4"],
                //     "slots-alterable": ["field3", "field4"],
                //     "features": ["sync:th", "sync:battery", "mod:no_net", "mod:wifi_mode", "mod:data_led", "mod:net_mode"],
                //     // "power-constants": { "c1": 1, "c2": 2, "c3": 3, "c4": 4 },
                //     "power-constants": {},
                // };

                // resp['sensor-profiles'] = {
                //     "th_t": { "u": 1, "name": "Termperature", "category": "1" },
                //     "th_h": { "u": 3, "name": "Humidity", "category": "2" },
                //     "volt": { "u": 5, "name": "Voltage", "category": "4" },
                //     "rssi_w": { "u": 6, "name": "WiFi RSSI", "category": "5" },
                //     "rssi_g": { "u": 11, "name": "GSM RSSI", "category": "5" },
                //     "light": { "u": 4, "name": "Light", "category": "3" },
                //     "r1_light": { "u": 23, "name": "RS485 Light", "category": "3" },
                //     "r1_th_t": { "u": 12, "name": "RS485 Temperature", "category": "1" },
                //     "r1_th_h": { "u": 13, "name": "RS485 Humidity", "category": "2" },
                //     "r1_sth_t": { "u": 10, "name": "RS485 Soli T", "category": "1" },
                //     "r1_sth_h": { "u": 15, "name": "RS485 Soli H", "category": "2" },
                //     "e1_t": { "u": 14, "name": "DS18B20 T", "category": "1" },
                //     "r1_t": { "u": 41, "name": "RS485 T", "category": "1" },
                //     "r1_ws": { "u": 21, "name": "Wind Velocity", "category": "0" },
                //     "r1_co2": { "u": 20, "name": "RS485 CO2", "category": "0" },
                //     "r1_co2_t": { "u": 51, "name": "RS485 CO2 T", "category": "1" },
                //     "r1_co2_h": { "u": 52, "name": "RS485 CO2 H", "category": "2" },

                //     "sw_s": { "u": 60, "name": "Switch State", "category": "6" },
                //     "sw_v": { "u": 61, "name": "Switch Voltage", "category": "4" },
                //     "sw_c": { "u": 62, "name": "Switch I", "category": "0" },
                //     "sw_p": { "u": 63, "name": "Switch P", "category": "0" },
                //     "sw_pc": { "u": 64, "name": "Switch PC", "category": "0" },
                // };

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
