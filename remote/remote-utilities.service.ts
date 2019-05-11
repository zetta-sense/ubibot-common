import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
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
    getIPCountry(): Observable<string> {
        const url = `https://api.ubibot.io/utilities/ip-info`; // 固定使用io, whatever io or cn
        return this.http.get(url).pipe(
            map((resp: any) => resp.country)
        );
    }



}