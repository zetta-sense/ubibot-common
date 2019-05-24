import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import * as _ from 'lodash';

export interface UbiLogsResponse<T> {
    currentItems: number;
    itemsPerPage: number;
    pageNumber: number;
    totalItems: number;

    data: T[];
}

export interface UbiTriggerLogsResponse extends UbiLogsResponse<UbiLogItemTrigger> {

}

export interface UbiAccessLogsResponse extends UbiLogsResponse<UbiLogItemAccess> {

}

export class UbiLogItemTrigger {
    action_frequency: string;
    channel_id: string;
    created_at: string;
    finished_at: string;
    full_log: string;
    log: string;
    rule_id: string;
    rule_name: string;
    rule_type: string;
    status: string;
    t_action_frequency: string;
    t_rule_name: string;
    t_rule_type: string;
    trigger_field: string;
    trigger_id: string;
    trigger_type: string;
    user_id: string;
    value: any; // 据观察，服务器一般返回string

    // 追加parse后的
    parsedFullLog: any;
    parsedLog: any;

    constructor(raw: any) {
        Object.assign(this, raw);
        Object.setPrototypeOf(this, UbiLogItemTrigger.prototype);

        this.parsedFullLog = this.getParsedFullLog();
        this.parsedLog = this.getParsedLog();
    }

    getParsedFullLog(): any {
        let ret = null;
        try {
            ret = JSON.parse(this.full_log);
        } catch (e) { }
        return ret;
    }

    getParsedLog(): any {
        let ret = null;
        try {
            ret = JSON.parse(this.log);
        } catch (e) { }
        return ret;
    }
}

export class UbiLogItemAccess {
    // todo: 暂时没仔细写类型，只是根据服务器返回的类型
    access_id: string;
    access_type: string;
    channel_id: string;
    created_at: string;
    size: string;
    sub_type: string;
    voltage: string;

    constructor(raw: any) {
        Object.assign(this, raw);
        Object.setPrototypeOf(this, UbiLogItemAccess.prototype);
    }
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
    listTriggerLogs(channelId: string, page: number = 0): Observable<UbiTriggerLogsResponse> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/triggers`;
        const params = {};
        params['channel_id'] = channelId;
        params['itemsPerPage'] = this.ubibotCommonConfig.DefaultItemsPerPage;

        if (page) {
            params['pageNumber'] = page;
        }

        return this.http.get(url, { params: params }).pipe(
            map((r: any) => {
                const resp = r as UbiTriggerLogsResponse;
                resp.data = _.map(r.triggers, (x) => new UbiLogItemTrigger(x));
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
     * @param {string} channelId
     * @param {number} [page=0]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    private listAccessLogs(channelId: string, type: 'in' | 'out', page: number = 0): Observable<UbiAccessLogsResponse> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!type) throw new UbiError('Type is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/access_logs`;
        const params = {};
        params['itemsPerPage'] = this.ubibotCommonConfig.DefaultItemsPerPage;
        params['access_type'] = type;

        if (page) {
            params['pageNumber'] = page;
        }

        return this.http.get(url, { params: params }).pipe(
            map((r: any) => {
                const resp = r as UbiAccessLogsResponse;
                resp.data = _.map(r.access_logs, (x) => new UbiLogItemAccess(x));
                resp.itemsPerPage = parseFloat(r.itemsPerPage);
                resp.pageNumber = parseFloat(r.pageNumber);
                return resp;
            })
        );
    }


    /**
     * List download logs by channel.
     *
     * @param {string} channelId
     * @param {number} [page]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    listDownloadLogs(channelId: string, page?: number): Observable<UbiAccessLogsResponse> {
        return this.listAccessLogs(channelId, 'out', page);
    }


    /**
     * List upload logs by channel.
     *
     * @param {string} channelId
     * @param {number} [page]
     * @returns {Observable<UbiLogsResponse>}
     * @memberof RemoteLogsService
     */
    listUploadLogs(channelId: string, page?: number): Observable<UbiAccessLogsResponse> {
        return this.listAccessLogs(channelId, 'in', page);
    }
}
