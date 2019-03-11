import {Injectable} from '@angular/core';
import {filter, map} from "rxjs/operators";
import {AsyncSubject, ReplaySubject, Subject, Subscription} from 'rxjs';

interface UbiEvent {
    type: string;
    data: any;
}

type UbiEventCallback = (data: any) => void;

@Injectable({
    providedIn: 'root', // singleton
})
export class UbiEventService {

    handler = new Subject<UbiEvent>();

    broadcast(type: string, data: any = {}) {
        // UbiEventService.handler.next({type, data});
        this.handler.next({type, data});
    }

    /**
     * 若要off, 需要自行对返回的Subscription进行unsubscribe
     * @param {string} type
     * @param {UbiEventCallback} callback
     * @returns {Subscription}
     */
    on(type: string, callback: UbiEventCallback): Subscription {
        return this.handler
            .pipe(
                filter((event: UbiEvent) => event.type === type),
                map((event: UbiEvent) => event.data)
            )
            .subscribe(callback);
    }


}
