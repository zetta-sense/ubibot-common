import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';

@Injectable()
export class RemoteChannelService {

    constructor(private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    /**
     * Get my channels.
     * 任何时候remote service都只返回实体，不返回dao，由于要保证dao的稳定单一，dao应该交由resolver或其它处理器创建
     *
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteChannelService
     */
    list(): Observable<UbiChannel[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/channels`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.channels)
        );//.subscribe(resp => resp)
    }

    /**
     * Get a channel.
     * 任何时候remote service都只返回实体，不返回dao，由于要保证dao的稳定单一，dao应该交由resolver或其它处理器创建
     *
     * @param {string} channelId
     * @returns {Observable<UbiChannel>}
     * @memberof RemoteChannelService
     */
    get(channelId: string): Observable<UbiChannel> {

        if(!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}`;
        return this.http.get(url).pipe(
            map((resp: UbiChannel) => {
                return new UbiChannelDAO(resp.channel);
            })
        );
    }

}
