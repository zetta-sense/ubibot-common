import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';

export interface UbiMobileServicePrice {
    area: string,
    price: number,
}

/**
 * A client service for remote finance service.
 *
 * @export
 * @class RemoteFinanceService
 * @author gorebill
 */
@Injectable()
export class RemoteFinanceService {

    constructor(
        private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }


    private _cache1: any = {}; // for sms
    private _cache2: any = {}; // for voice

    /**
     * 根据区号获取SMS的服务价格，如果是cn，区号无效
     * 区号可带加号或不带
     *
     * @param {string} areaCode
     * @param {boolean} noCache 是否清空cache
     * @returns {Observable<UbiMobileServicePrice>}
     * @memberof RemoteFinanceService
     */
    getPriceSMS(areaCode: string, noCache: boolean = false): Observable<UbiMobileServicePrice> {
        // 如果不是加号开头则追加，因为服务器返回的区号key带加号
        if (areaCode && !/^[+]/i.test(areaCode)) {
            areaCode = `+${areaCode}`;
        }

        noCache ? this._cache1 = {} : null; // clear cache if necessary
        let cached = this._cache1[areaCode];

        if (this.ubibotCommonConfig.isServeCN()) { // CN
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/china_sms_voice_pricing`;
            return cached ? of(cached) : this.http.get(url).pipe(
                map((resp: any) => {
                    let ret = {
                        area: 'China',
                        price: resp.sms,
                    };
                    return ret;
                }),
                tap((ret) => this._cache1[areaCode] = ret), // update cache
            );
        } else { // IO国际
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/sms_pricing`;
            return cached ? of(cached) : this.http.get(url).pipe(
                map((resp: any) => {
                    // tag: 理论上sms_pricing每次都是同一个标，这里的cache能够更加优化，但为了统一处理，依然以areaCode作为cache key，即不同area将会再访问
                    const item = resp.sms_pricing[areaCode];
                    // console.log(item, areaCode, resp);
                    return item ? {
                        area: item[0],
                        price: item[2]
                    } : null;
                }),
                tap((ret) => this._cache1[areaCode] = ret), // update cache
            );
        }
    }


    /**
     * 根据区号及电话号码获取语音服务价格，如果是cn，区号无效
     * 区号可带加号或不带
     *
     * @param {string} areaCode
     * @param {string} phoneNumber
     * @returns {Observable<UbiMobileServicePrice>}
     * @memberof RemoteFinanceService
     */
    getPriceVoice(areaCode: string, phoneNumber: string, noCache: boolean = false): Observable<UbiMobileServicePrice> {
        // 如果不是加号开头则追加，因为服务器返回的区号key带加号
        if (areaCode && !/^[+]/i.test(areaCode)) {
            areaCode = `+${areaCode}`;
        }

        noCache ? this._cache1 = {} : null; // clear cache if necessary
        let cached = this._cache2[areaCode];

        if (this.ubibotCommonConfig.isServeCN()) { //  CN
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/china_sms_voice_pricing`;
            return cached ? of(cached) : this.http.get(url).pipe(
                map((resp: any) => {
                    return {
                        area: 'China',
                        price: resp.voice
                    };
                }),
                tap((ret) => this._cache2[areaCode] = ret), // update cache
            );
        } else { // IO国际
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/international_voice_pricing`;
            let combined = `${areaCode}${phoneNumber}`;

            const params = new HttpParams()
                .set('number', combined)
                .set('platform', 'io');
            return cached ? of(cached) : this.http.get(url, { params: params }).pipe(
                map((resp: any) => {
                    return {
                        area: resp.country,
                        price: resp.price,
                    };
                }),
                tap((ret) => this._cache2[areaCode] = ret), // update cache
            );
        }
    }

}
