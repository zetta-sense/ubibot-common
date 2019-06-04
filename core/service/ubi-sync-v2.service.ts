import { Injectable, OnDestroy } from '@angular/core';
import { RemoteChannelService } from '../../remote/remote-channel.service';
import { UbiChannel, UbiChannelDAO } from '../../entities/ubi-channel.entity';
import { interval, Observable, EMPTY, timer, from, of, Subscription, OperatorFunction, Subject, BehaviorSubject, race, merge, empty, throwError } from 'rxjs';
import { flatMap, catchError, timeout, delay, mergeMap, tap, finalize, map, switchMap, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { UbiError } from '../../errors/UbiError';
import { EnumAppError } from '../../enums/enum-app-error.enum';
import { UbiUtilsService } from '../../services/ubi-utils.service';
import { UbibotCommonConfigService } from '../../providers/ubibot-common-config.service';

export interface UbiSyncV2Mixer<T> {
    pull: () => Observable<T>;
    merge: (t: T) => Observable<T>;
}

@Injectable()
export class UbiSyncV2Service implements OnDestroy {

    private paused: boolean = false;

    private refresh$ = new Subject<void>();

    private refreshed$ = new Subject<void>();

    constructor(
        private ubiUtils: UbiUtilsService,
        private remoteChannel: RemoteChannelService,
        private ubiCommonConfig: UbibotCommonConfigService,
    ) {
        console.log('UbiSyncV2Service creating instance...');
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    isPaused() {
        return this.paused;
    }

    makeSync<T>(
        syncMixer: UbiSyncV2Mixer<T>,
        syncDelay: number = 500,
        syncInterval: number = 5 * 60 * 1000,
        syncNoErrors: boolean = false,
    ): Observable<T> {
        return merge(
            // 按时pull的信号，如果pause了则不产生
            timer(syncDelay, syncInterval).pipe(
                switchMap((x) => {
                    return this.isPaused() ? EMPTY : of(x);
                }),
            ),
            // 强制refresh的信号
            this.refresh$.pipe(
                tap(() => console.log('Forced a sync.')),
            ),
        ).pipe(
            switchMap(() => {
                return syncMixer.pull();
            }),
            switchMap((data) => {
                return syncMixer.merge(data);
            }),
            tap(() => this.refreshed$.next()),
            // 如果syncNoErrors = true则忽略错误
            catchError((err) => {
                // this.ubiUtils.snack('Error occurs while sync.');
                return syncNoErrors ? EMPTY : throwError(err);
            }),
        );
    }


    /**
     * 当下一次刷新时触发，仅成功时，只触发一次
     * 如果超时会返回rx timeout error
     *
     * @returns {Observable<void>}
     * @memberof UbiSyncV2Service
     */
    waitRefreshDone(): Observable<void> {
        return this.refreshed$.pipe(
            take(1),
            timeout(this.ubiCommonConfig.ServerAccessTimeout),
        );
    }

    /**
     * Force a refresh.
     *
     * @memberof UbiSyncV2Service
     */
    refresh() {
        this.refresh$.next();
    }

    ngOnDestroy() {
        console.log(`UbiSyncV2Service destroyed...`);
    }
}

export class UbiSyncV2MixerChannelsImpl implements UbiSyncV2Mixer<UbiChannelDAO[]> {

    private firstRun: boolean = true;
    private source: UbiChannelDAO[];
    private puller: Observable<UbiChannel[]>; // 不需要DAO，兼容remote API

    constructor(_source: UbiChannelDAO[], _puller: Observable<UbiChannel[]>) {
        if (!_source) throw new UbiError('Source is required for this API');
        if (!_puller) throw new UbiError('Puller is required for this API');

        this.source = _source;
        this.puller = _puller;
    }

    pull(): Observable<UbiChannelDAO[]> {
        return this.puller.pipe(
            switchMap((channels) => {
                const ret = _.map(channels, (channel) => {
                    const channelDAO: UbiChannelDAO = new UbiChannelDAO(channel);
                    return channelDAO;
                });
                return of(ret);
            }),
            // 排序
            map((data: UbiChannelDAO[]) => {
                // tag: 只在第一次时进行排序
                if (this.firstRun) {
                    data.sort((a: UbiChannel, b: UbiChannel) => {
                        const aio = a.isOnline();
                        const bio = b.isOnline();

                        if (aio && !bio) {
                            return -1;
                        } else if (!aio && bio) {
                            return 1;
                        }

                        return 0;
                    });
                }
                this.firstRun = false;
                return data;
            }),
        );
    }

    merge(newData: UbiChannelDAO[]) {
        // 新数据中不存在的准备移除
        const channelsToRemove: UbiChannelDAO[] = [];
        this.source.forEach((channelDAO) => {
            const existInNewData = newData.find((channelData) => channelData.channel_id === channelDAO.channel_id);
            if (!existInNewData) {
                channelsToRemove.push(channelDAO);
            }
        });
        _.pullAll(this.source, channelsToRemove);
        // console.log('正在移除:', channelsToRemove, this.source);

        // 合并新数据
        newData.forEach((channelData: UbiChannelDAO) => {
            const found = this.source.find((channelDAO) => channelDAO.channel_id === channelData.channel_id);
            if (found) {
                // merge
                found.merge(channelData);
            } else {
                // create
                const dao = new UbiChannelDAO(channelData);
                this.source.push(dao); // 为什么不用unshift，因为如果再前面添加，容易造成抖动
            }
        });

        return of(this.source);
    }
}
