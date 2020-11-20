import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast, share } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel, UbiChannelVirtualFieldLike } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { DatePipe } from '@angular/common';
import { UbiChannelVPref } from '../entities/ubi-channel-vpref.entity';
import { UbiVFieldFunction } from '../entities/ubi-vfield-function.entity';

/**
 *
 *
 * @export
 * @class RemoteVFieldService
 */
@Injectable()
export class RemoteVFieldService {

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }

    /**
     * Get my channels.
     * 任何时候remote service都只返回实体，不返回dao，由于要保证dao的稳定单一，dao应该交由resolver或其它处理器创建
     *
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteChannelService
     */
    list(channelId: string): Observable<UbiChannelVirtualFieldLike[]> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let params = {
            channel_id: channelId,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/channel_virtual_fields/list`;
        return this.http.get(url, { params: params }).pipe(
            // map((resp: any) => resp.channels),
            concatMap((resp: any) => {
                // return of(this.extractChannels(resp));
                return of(resp.virtual_fields);
            }),
        );//.subscribe(resp => resp)
    }

    listAvailableFunctions(): Observable<UbiVFieldFunction[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/channel_virtual_fields/public_functions/list`;
        return this.http.get(url).pipe(
            // map((resp: any) => resp.channels),
            concatMap((resp: any) => {
                // return of(this.extractChannels(resp));
                return of(resp.functions.map(obj => new UbiVFieldFunction(obj.name)));
            }),
        );//.subscribe(resp => resp)
    }


    save(vfieldJson: any): Observable<any> {
        if (vfieldJson.virtual_id == null) { // 新建
            const url = `${this.ubibotCommonConfig.EndPoint}/channel_virtual_fields/create`;
            return this.http.post(url, vfieldJson).pipe(
                map((resp: any) => {
                    return resp;
                }),
            );
        } else { // 修改
            const url = `${this.ubibotCommonConfig.EndPoint}/channel_virtual_fields/update`;
            return this.http.post(url, vfieldJson).pipe(
                map((resp: any) => {
                    return resp;
                }),
            );
        }
    }

    remove(vfId: string): Observable<any> {
        const url = `${this.ubibotCommonConfig.EndPoint}/channel_virtual_fields/delete`;

        const params: any = {
            virtual_id: vfId,
        };

        return this.http.post(url, null, { params: params }).pipe(
            map((resp: any) => {
                return resp;
            }),
        );
    }
}
