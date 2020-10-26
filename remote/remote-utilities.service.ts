import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiError } from '../errors/UbiError';


/**
 * Remote utilities.
 *
 * @export
 * @class RemoteUtilitiesService
 */
@Injectable()
export class RemoteUtilitiesService {

    constructor(
        private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }



    /**
     * 返回当前ip的country
     *
     * 如果是国内，一般是China
     *
     * 如果是HK，一般是Hong Kong
     *
     * @returns {Observable<string>}
     * @memberof RemoteUtilitiesService
     */
    getIPCountryIO(): Observable<string> {
        const url = `https://api.ubibot.com/utilities/ip-info`; // 固定使用io
        return this.http.get(url).pipe(
            map((resp: any) => resp.country)
        );
    }

    getIPCountryCN(): Observable<string> {
        const url = `https://api.ubibot.cn/utilities/ip-info`; // 固定使用cn
        return this.http.get(url).pipe(
            map((resp: any) => resp.country)
        );
    }

    getIPCountry(): Observable<string> {
        return race(
            this.getIPCountryCN(),
            this.getIPCountryIO(),
        ).pipe(
            switchMap((country: string) => {
                return of(country);
            }),
        );
    }

    getServerTime(): Observable<string> {
        const url = `${this.ubibotCommonConfig.EndPoint}/utilities/time`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.server_time)
        );
    }

    /**
     * 返回服务器与客户端的时间校准值 in ms
     *
     * @returns {Observable<number>} delta = server - client
     * @memberof RemoteUtilitiesService
     */
    getDeltaTime(): Observable<number> {
        return this.getServerTime().pipe(
            switchMap(x => {
                const serverTime = new Date(x).getTime();
                const clientTime = new Date().getTime();
                return of(serverTime - clientTime);
            }),
        );
    }

}
