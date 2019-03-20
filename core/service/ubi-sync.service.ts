import { Injectable, OnDestroy } from '@angular/core';
import { RemoteChannelService } from '../../remote/remote-channel.service';
import { UbiChannel, UbiChannelDAO } from '../../entities/ubi-channel.entity';
import { interval, Observable, EMPTY, timer, from, of, Subscription, OperatorFunction, Subject, BehaviorSubject } from 'rxjs';
import { flatMap, catchError, timeout, delay, mergeMap, tap } from 'rxjs/operators';
import * as _ from 'lodash';

@Injectable()
export class UbiSyncService implements OnDestroy {

    constructor(private remoteChannel: RemoteChannelService
    ) {


    }

    startSync(puller: Observable<any>,
        merger: OperatorFunction<{}, {}>,
        _delay: number = 500,
        _interval: number = 5 * 60 * 1000,
    ): Observable<any> {

        let subscription: Subscription;

        return timer(_delay, _interval)
            .pipe(
                mergeMap((t) => {
                    // console.log(`Unsubscribing the previous one...`);
                    subscription && subscription.unsubscribe();
                    return of(t);
                }),
                mergeMap((t) => {
                    // console.log(`Making next request...`);
                    const ob = new Observable((observer) => {
                        subscription = puller.subscribe(observer);
                        return subscription;
                    });
                    // setTimeout(() => {
                    //     subscription.unsubscribe();
                    // }, (t % 3 + 1) * 100);
                    return ob;
                }),
                merger, // 如果cancel subscription，不会执行
                // mergeMap((data) => { // 如果cancel，不会执行
                //     // console.log(`====>`, data);
                //     return of(data);
                // }),
            );
    }

    startSyncMyChannels(src$: BehaviorSubject<UbiChannelDAO[]>, _delay?: number, _interval?: number): Observable<UbiChannelDAO[]> {
        const src = src$.getValue();

        const puller: Observable<UbiChannel> = this.remoteChannel.list().pipe(catchError(() => EMPTY));
        const merger: OperatorFunction<{}, {}> = mergeMap((data: UbiChannel[]) => {

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

            return of(src);
        });

        // this.startSync(puller, merger, _delay, _interval).subscribe((next) => {
        //     console.log('----> next: ', next);
        // });

        return new Observable((observer) => this.startSync(puller, merger, _delay, _interval).subscribe(observer));
    }


    ngOnDestroy() {
        console.log(`UbiSyncService destroyed...`);
    }
}
