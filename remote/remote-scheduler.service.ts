import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race, throwError } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast, share } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { DatePipe } from '@angular/common';
import { UbiChannelVPref } from '../entities/ubi-channel-vpref.entity';
import { UbiScheduler, UbiSchedulerType, UbiSchedulerActionSetState } from '../entities/ubi-scheduler.entity';
import { RemoteChannelService } from './remote-channel.service';
import { EnumAppError } from '../enums/enum-app-error.enum';


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

    /**
     * Edit a Scheduler
     * PUT http://api.ubibot.cn/channels/CHANNEL_ID/schedulers/SCHEDULER_ID
     *
     *
     * replacing CHANNEL_ID with the ID of your channel, SCHEDULER_ID as s_id
     *
     *
     * 对于count_down倒计时，最多只能存在1条记录，并且运行完毕后删除，所以可直接用Add a Scheduler进行更改/创建操作。
     *
     *
     * 注意不能切换s_type， 是能删除重新添加。
     * Valid request parameters:
     *
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     * s_type : Type of the scheduler: schedule or count_down or loop (required)。 分别是定时，倒计时，循环。
     * s_port:  choose one of: port1, port2, port 3, port4 (required)。 表示对应开关的编号。
     * 其他参数与Add a Scheduler相同。
     *
     * @param {string} channelId
     * @param {UbiScheduler} scheduler
     * @returns {Observable<any>}
     * @memberof RemoteSchedulerService
     */
    update(channelId: string, scheduler: UbiScheduler): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!scheduler) throw new UbiError('UbiScheduler is required for this API!');

        const payload = scheduler.toPersistentObject();

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/schedulers/${scheduler.s_id}`;
        return this.http.put(url, payload).pipe(
            switchMap((resp) => {
                return of(resp);
            }),
        );
    }

    /**
     * Add a Scheduler
     * POST http://api.ubibot.cn/channels/CHANNEL_ID/schedulers
     *
     *
     * replacing CHANNEL_ID with the ID of your channel
     *
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     *
     * 若返回错位是over_limit，表示定时数量超过规定上限。
     *
     * 公用参数：
     *
     * s_type : Type of the scheduler: schedule or count_down or loop (required)。 分别是定时，倒计时，循环。
     * s_port:  choose one of: port1, port2, port 3, port4 (required)。 表示对应开关的编号。
     *
     * rule_status: enabled or disabled (optional) 启动或关闭
     * 附加参数，如果s_type是schedule ：
     *
     * s_repeat (required): once 或星期几由逗号分隔数字表示。 如：1,2,3表示每周一，周二，周三。 1,2,3,4,5,6,7表示周一到周日, once表示仅执行一次；
     * action_1 (optional): 对应JSON指令值,如： "{\"action\":\"command\",\"set_state_plug1\":0,\"s_port\":\"port1\"}"
     * action_1_at (optional): 对应定时日的分钟值，如02:15则为2*60+15=135。23:20为23*60+20=1400。
     * action_2 (optional): 同action_1类似
     * action_2_at (optional): 同action_1类似
     * timezone (optional):  对应时区，不提供则为默认用户账户时区
     * 附加参数，如果s_type是count_down ：倒计时功能
     *
     * action_1 (optional): 对应JSON指令值,如： "{\"action\":\"command\",\"set_state_plug1\":0,\"s_port\":\"port1\"}"
     * action_1_at (optional):  表示从当前计算此分钟之后关闭，例如10，表示10分钟后关闭。最大值为1440既24小时后关闭。 由服务器自动计算时间。 注意：如果获取返回时，此值将是时间戳。
     * 附加参数，如果s_type是loop ：循环功能
     *
     * s_repeat (required): 星期几由逗号分隔数字表示。 如：1,2,3表示每周一，周二，周三。 1,2,3,4,5,6,7表示周一到周日。 默认周一到周日。
     * action_1 (required): 对应JSON指令值,如： "{\"action\":\"command\",\"set_state_plug1\":0,\"s_port\":\"port1\"}"
     * action_1_at (required): 对应循环开启的当日分钟值，如02:15则为2*60+15=135。23:20为23*60+20=1400。
     * action_1_duration (required): action_1的开启时效（例如通电时长）
     * action_2 (required): 同action_1类似
     * action_2_at (required): 同action_1类似
     * action_2_duration (required): action_2的开启时效（例如断电时长）
     * counter_max (required): 最大循环次数，无限循环为0，最大是100，0000.  默认0.
     * timezone (optional):  对应时区，不提供则为默认用户账户时区
     *
     * @param {string} channelId
     * @param {UbiScheduler} scheduler
     * @returns {Observable<any>}
     * @memberof RemoteSchedulerService
     */
    create(channelId: string, scheduler: UbiScheduler): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!scheduler) throw new UbiError('UbiScheduler is required for this API!');

        if (!scheduler.s_repeat) return throwError(new UbiError(EnumAppError.PARAMETER_SCHEDULER_S_REPEAT_EMPTY));

        const payload = scheduler.toPersistentObject();

        // let formData: FormData = new FormData();
        // formData.append('command_string', command);
        // if (position != null) {
        //     formData.append('position', `${position}`);
        // }

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/schedulers`;
        return this.http.post(url, payload).pipe(
            switchMap((resp) => {
                return of(resp);
            }),
        );
    }


    /**
     * 根据s_id自动决定保存还是修改
     *
     * @param {string} channelId
     * @param {UbiScheduler} scheduler
     * @returns {Observable<any>}
     * @memberof RemoteSchedulerService
     */
    save(channelId: string, scheduler: UbiScheduler): Observable<any> {
        if (scheduler.s_id != null) {
            return this.update(channelId, scheduler);
        } else {
            return this.create(channelId, scheduler);
        }
    }

    /**
     * Delete a Scheduler
     * DELETE http://api.ubibot.cn/channels/CHANNEL_ID/schedulers/SCHEDULER_ID
     *
     *
     * replacing CHANNEL_ID with the ID of your channel, SCHEDULER_ID as s_id
     *
     *
     * Valid request parameters:
     *
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     *
     * @param {string} channelId
     * @param {string} schedulerId
     * @returns {Observable<any>}
     * @memberof RemoteSchedulerService
     */
    removeScheduler(channelId: string, schedulerId: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!schedulerId) throw new UbiError('Scheduler ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/schedulers/${schedulerId}`;
        return this.http.delete(url).pipe(
            map((x: any) => x),
        );
    }
}
