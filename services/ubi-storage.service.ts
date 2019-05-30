import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';

export const UBIBOT_STORAGE_AGENT = new InjectionToken<UbiStorageAgent>('UBIBOT_UTILS_DIALOG_AGENT');


export declare type IFuncStorageSet = (key: string, data: string) => void;
export declare type IFuncStorageGet = (key: string) => string;

export interface UbiStorageAgent {
    set: IFuncStorageSet;
    get: IFuncStorageGet;
}



@Injectable({
    providedIn: 'root'
})
export class UbiStorageService {

    constructor(
        @Optional() @Inject(UBIBOT_STORAGE_AGENT) private storageAgent: UbiStorageAgent
    ) {
        if (!storageAgent) {
            this.storageAgent = {
                set: (key: string, data: string) => {
                    console.log('UbiStorageService saving by default:', data);
                    localStorage.setItem(key, data);
                    return;
                },
                get: (key: string) => {
                    console.log('UbiStorageService retrieving by default:', key);
                    const ret = localStorage.getItem(key);
                    return ret;
                },
            };
        }
    }

    save(key: string, data: string): void {
        this.storageAgent.set(key, data);
    }

    get(key: string): string {
        return this.storageAgent.get(key);
    }
}
