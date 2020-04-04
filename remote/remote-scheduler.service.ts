import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast, share } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { DatePipe } from '@angular/common';
import { UbiChannelVPref } from '../entities/ubi-channel-vpref.entity';
import { UbiScheduler, UbiSchedulerType, UbiSchedulerActionSetState } from '../entities/ubi-scheduler.entity';
import { RemoteChannelService } from './remote-channel.service';


/**
 * A client service for remote scheduler service.
 *
 * @export
 * @class RemoteSchedulerService
 * @author gorebill
 */
@Injectable()
export class RemoteSchedulerService {

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private remtoeChannel: RemoteChannelService,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }

    /**
     * List Schedulers
     * GET http://api.ubibot.cn/channels/CHANNEL_ID/schedulers
     *
     *
     * replacing CHANNEL_ID with the ID of your channel
     *
     *
     * Valid request parameters:
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     * 返回中：action_1_exe, action_2_exe表示对应的运行时间。
     *
     * @returns {Observable<UbiScheduler[]>}
     * @memberof RemoteChannelService
     */
    list(channelId: string): Observable<UbiScheduler[]> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/schedulers`;
        return combineLatest(
            this.http.get(url),
            this.remtoeChannel.get(channelId),
        ).pipe(
            switchMap(([resp, channel]: any[]) => {
                const ret = _.map(resp.schedulers, (raw) => {
                    return new UbiScheduler(raw, channel);
                });
                return of(ret);
            }),
        );
    }

    listTypeSchedule(channelId: string): Observable<UbiScheduler[]> {
        return this.list(channelId).pipe(
            switchMap((schedulers: UbiScheduler[]) => {
                const ret = schedulers.filter((scheduler) => {
                    return scheduler.s_type == UbiSchedulerType.Schedule;
                });
                return of(ret);
            }),
        );
    }


    /**
     * Change Scheduler Status
     * PUT http://api.ubibot.cn/channels/CHANNEL_ID/schedulers/SCHEDULER_ID/scheduler_status
     *
     *
     * replacing CHANNEL_ID with the ID of your channel
     *
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     * rule_status: enabled or disabled (required) 启动或关闭
     * 更新状态后，定时器运行的action_1_exe, action_2_exe将被重置。
     *
     * @param {string} channelId
     * @param {string} schedulerId
     * @param {UbiSchedulerActionSetState} state
     * @returns {Observable<any>}
     * @memberof RemoteSchedulerService
     */
    setStatus(channelId: string, schedulerId: string, state: 'enabled' | 'disabled'): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!schedulerId) throw new UbiError('Scheduler ID is required for this API!');

        const payload = {
            s_status: state,
        };

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/schedulers/${schedulerId}/scheduler_status`;
        return this.http.put(url, payload).pipe(
            switchMap((resp) => {
                return of(resp);
            }),
        );
    }
}
