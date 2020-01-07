import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiTriggerLog } from '../entities/ubi-trigger-log.entity';
import { UbiAccessLog } from '../entities/ubi-access-log.entity';
import * as _ from 'lodash';

export interface UbiLogsResponse<T> {
    currentItems: number;
    itemsPerPage: number;
    pageNumber: number;
    totalItems: number;

    data: T[];
}

export interface UbiTriggerLogsResponse extends UbiLogsResponse<UbiTriggerLog> {

}

export interface UbiAccessLogsResponse extends UbiLogsResponse<UbiAccessLog> {

}


@Injectable()
export class RemoteLogsService {

    constructor(
        private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }


    /**
     *  List trigger logs by channel.
     *
     * @param {string} channelId
     * @returns {Observable<any>}
     * @memberof RemoteLogsService
     */
    listTriggerLogs(channel: UbiChannel, page: number = 0): Observable<UbiTriggerLogsResponse> {
        if (!channel) throw new UbiError('Channel is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/triggers`;
        const params = {};
        params['channel_id'] = channel.channel_id;
        params['itemsPerPage'] = this.ubibotCommonConfig.DefaultItemsPerPage;

        if (page) {
            params['pageNumber'] = page;
        }

        return this.http.get(url, { params: params }).pipe(
            map((r: any) => {
                const resp = r as UbiTriggerLogsResponse;
                resp.data = _.map(r.triggers, (x) => new UbiTriggerLog(x, channel));
                resp.itemsPerPage = parseFloat(r.itemsPerPage);
                resp.pageNumber = parseFloat(r.pageNumber);
                return resp;
            })
        );
    }


    /**
     * Channel Access Logs 访问请求历史记录
     *
     * Send GET/POST to http://api.ubibot.cn/channels/CHANNEL_ID/access_logs
     * Valid request parameters:
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     * pageNumber (string): page number for the request (optional)
     * itemsPerPage (string): number of items page page (optional)
     * access_type (string): in 或 out
     *
     * @param {UbiChannel} channel
     * @param {number} [page=0]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    private listAccessLogs(channel: UbiChannel, type: 'in' | 'out', page: number = 0): Observable<UbiAccessLogsResponse> {
        if (!channel) throw new UbiError('Channel is required for this API!');
        if (!type) throw new UbiError('Type is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channel.channel_id}/access_logs`;
        const params = {};
        params['itemsPerPage'] = this.ubibotCommonConfig.DefaultItemsPerPage;
        params['access_type'] = type;

        if (page) {
            params['pageNumber'] = page;
        }

        return this.http.get(url, { params: params }).pipe(
            map((r: any) => {
                const resp = r as UbiAccessLogsResponse;
                resp.data = _.map(r.access_logs, (x) => new UbiAccessLog(x, channel));
                resp.itemsPerPage = parseFloat(r.itemsPerPage);
                resp.pageNumber = parseFloat(r.pageNumber);
                return resp;
            })
        );
    }


    /**
     * List download logs by channel.
     *
     * @param {UbiChannel} channel
     * @param {number} [page]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    listDownloadLogs(channel: UbiChannel, page?: number): Observable<UbiAccessLogsResponse> {
        return this.listAccessLogs(channel, 'out', page);
    }


    /**
     * List upload logs by channel.
     *
     * @param {UbiChannel} channel
     * @param {number} [page]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    listUploadLogs(channel: UbiChannel, page?: number): Observable<UbiAccessLogsResponse> {
        return this.listAccessLogs(channel, 'in', page);
    }
}
