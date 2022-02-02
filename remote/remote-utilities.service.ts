import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race, timer, EMPTY, throwError } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast, retry, retryWhen, catchError, delay, timeout } from 'rxjs/operators';
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

    /**
     * 通过服务器获取本地IP
     *
     * 最多尝试30秒，每个请求每2秒一次，因此在无网络下，会等待较长时间才throwError
     *
     * @returns {Observable<string>}
     * @memberof RemoteUtilitiesService
     */
    getIPCountry(): Observable<string> {
        return race(
            // 注意这里一定要分开每个observable独立一个retry，否则如果在race的pipe中只要有一个raise error，都会立即触发complete并retry
            this.getIPCountryCN().pipe(retryWhen(() => timer(2000, 2000))),
            this.getIPCountryIO().pipe(retryWhen(() => timer(2000, 2000))),
        ).pipe(
            // retryWhen((errs) => errs.pipe(delay(1000), take(30), concatMap(es => throwError(es)))),
            timeout(30 * 1000),
            concatMap((country: string) => {
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
