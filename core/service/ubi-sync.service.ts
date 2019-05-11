import { Injectable, OnDestroy } from '@angular/core';
import { RemoteChannelService } from '../../remote/remote-channel.service';
import { UbiChannel, UbiChannelDAO } from '../../entities/ubi-channel.entity';
import { interval, Observable, EMPTY, timer, from, of, Subscription, OperatorFunction, Subject, BehaviorSubject, race, merge } from 'rxjs';
import { flatMap, catchError, timeout, delay, mergeMap, tap, finalize, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { UbiError } from '../../errors/UbiError';

export interface UbiSyncReturn {
    result: Observable<UbiChannelDAO[]>;
    error: BehaviorSubject<UbiError>;
}

@Injectable()
export class UbiSyncService implements OnDestroy {

    private static paused: boolean = false;

    private firstRun: boolean = true;

    private refresh$ = new Subject<number>();

    constructor(private remoteChannel: RemoteChannelService
    ) {
        console.log('UbiSyncService creating instance...');
    }

    static pause() {
        this.paused = true;
    }

    static resume() {
        this.paused = false;
    }

    static isPaused() {
        return this.paused;
    }


    /**
     * Force a refresh.
     *
     * @memberof UbiSyncService
     */
    refresh() {
        this.refresh$.next(-1);
    }

    startSync(puller: Observable<UbiChannel[]>,
        merger: OperatorFunction<{}, {}>,
        _delay: number = 500,
        _interval: number = 5 * 60 * 1000,
    ): Observable<any> {

        let subscription: Subscription;

        return merge(
            timer(_delay, _interval),
            this.refresh$.pipe(
                tap(() => console.log('Forced a sync.')),
            ),
        )
            // return timer(_delay, _interval)
            .pipe(
                mergeMap((t) => {
                    // console.log(`Unsubscribing the previous one...`);
                    subscription && subscription.unsubscribe();
                    return of(t);
                }),
                mergeMap((t) => {
                    // console.log(`Making next request...`);
                    const ob = new Observable((observer) => {
                        if (UbiSyncService.paused && !this.firstRun) {
                            // tag: return null to make merger ignore this
                            observer.next(null);
                            return { unsubscribe() { } }; // unscubscribable
                        } else {
                            // console.log('dat2a=', t);
                            subscription = puller.subscribe(observer);
                            return subscription;
                        }
                    });
                    // setTimeout(() => {
                    //     subscription.unsubscribe();
                    // }, (t % 3 + 1) * 100);
                    return ob;
                }),
                merger, // 如果cancel subscription，不会执行
                // 排序
                map((data: UbiChannel[]) => {
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
                    return data;
                }),
                // mergeMap((data) => { // 如果cancel，不会执行
                //     // console.log(`====>`, data);
                //     return of(data);
                // }),
                tap(() => {
                    this.firstRun = false;
                })
            );
    }

    // startSyncMyChannels2(): Observable<any[]> {
    //     const errorLogger = new Observable<UbiError>(); // a side kick error logger

    //     // tag: EMPTY会忽略执行下一个subscription，所以返回of(null)
    //     const puller: Observable<UbiChannel[]> = this.remoteChannel.list().pipe(catchError((err) => {
    //         //tag: log down error
    //         errorLogger.next(err);
    //         return of(null);
    //     }));
    // }

    startSyncMyChannels(src$: BehaviorSubject<UbiChannelDAO[]>, _delay?: number, _interval?: number): UbiSyncReturn {
        const errorLogger = new BehaviorSubject<UbiError>(null); // a side kick error logger
        let src = src$.getValue();

        // tag: EMPTY会忽略执行下一个subscription，所以返回of(null)
        const puller: Observable<UbiChannel[]> = this.remoteChannel.list().pipe(catchError((err) => {
            //tag: log down error
            errorLogger.next(err);
            return of(null);
        }));

        const merger: OperatorFunction<{}, {}> = mergeMap((data: UbiChannel[]) => {

            // console.log('data=', data, src);

            if (!src) {
                src = [];
                src$.next(src);
            }

            if (!data) { // 如果data为null则忽略此次
                return of(src);
            }

            // 新数据中不存在的准备移除
            const channelsToRemove: UbiChannelDAO[] = [];
            src.forEach((channelDAO) => {
                const existInNewData = data.find((channelData) => channelData.channel_id === channelDAO.channel_id);
                if (!existInNewData) {
                    channelsToRemove.push(channelDAO);
                }
            });
            _.pull(src, channelsToRemove);

            // 合并新数据
            data.forEach((channelData: UbiChannel) => {
                const found = src.find((channelDAO) => channelDAO.channel_id === channelData.channel_id);
                if (found) {
                    // merge
                    found.merge(channelData);
                } else {
                    // create
                    const dao = new UbiChannelDAO(channelData);
                    src.push(dao); // 为什么不用unshift，因为如果再前面添加，容易造成抖动
                }
            });

            // tag: log down error=null
            errorLogger.next(null);

            return of(src);
        });

        // this.startSync(puller, merger, _delay, _interval).subscribe((next) => {
        //     console.log('----> next: ', next);
        // });

        return {
            result: new Observable((observer) => this.startSync(puller, merger, _delay, _interval).subscribe(observer)),
            error: errorLogger,
        };
    }


    ngOnDestroy() {
        console.log(`UbiSyncService destroyed...`);
    }
}
