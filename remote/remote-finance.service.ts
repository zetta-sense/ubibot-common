import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';

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


    /**
     * 根据区号获取SMS的服务价格，如果是cn，区号无效
     * 区号可带加号或不带
     *
     * @param {string} areaCode
     * @returns {Observable<number>}
     * @memberof RemoteFinanceService
     */
    getPriceSMS(areaCode: string): Observable<number> {
        // 如果不是加号开头则追加，因为服务器返回的区号key带加号
        if (areaCode && !/^[+]/i.test(areaCode)) {
            areaCode = `+${areaCode}`;
        }

        if (this.ubibotCommonConfig.isServeCN()) { // CN
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/china_sms_voice_pricing`;
            return this.http.get(url).pipe(
                map((resp: any) => resp.sms)
            );
        } else { // IO国际
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/sms_pricing`;
            return this.http.get(url).pipe(
                map((resp: any) => {
                    const item = resp.sms_pricing[areaCode];
                    // console.log(item, areaCode, resp);
                    return item ? item[2] : null;
                })
            );
        }
    }


    /**
     * 根据区号及电话号码获取语音服务价格，如果是cn，区号无效
     * 区号可带加号或不带
     *
     * @param {string} areaCode
     * @param {string} phoneNumber
     * @returns {Observable<number>}
     * @memberof RemoteFinanceService
     */
    getPriceVoice(areaCode: string, phoneNumber: string): Observable<number> {
        // 如果不是加号开头则追加，因为服务器返回的区号key带加号
        if (areaCode && !/^[+]/i.test(areaCode)) {
            areaCode = `+${areaCode}`;
        }

        if (this.ubibotCommonConfig.isServeCN()) { //  CN
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/china_sms_voice_pricing`;
            return this.http.get(url).pipe(
                map((resp: any) => resp.voice)
            );
        } else { // IO国际
            let url = `${this.ubibotCommonConfig.EndPoint}/finance/international_voice_pricing`;
            let combined = `${areaCode}${phoneNumber}`;

            const params = new HttpParams()
                .set('number', combined)
                .set('platform', 'io');
            return this.http.get(url, { params: params }).pipe(
                map((resp: any) => resp.price)
            );
        }
    }

}
