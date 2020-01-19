import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { EnumAppConstant } from '../enums/enum-app-constant.enum';

export const UBIBOT_STORAGE_AGENT = new InjectionToken<UbiStorageAgent>('UBIBOT_UTILS_DIALOG_AGENT');


export declare type IFuncStorageSet = (key: string, data: string) => void;
export declare type IFuncStorageGet = (key: string) => string;
export declare type IFuncStorageClear = () => void;
export declare type IFuncStorageRemove = (key: string) => void;

export interface UbiStorageAgent {
    set: IFuncStorageSet;
    get: IFuncStorageGet;
    clear: IFuncStorageClear;
    remove: IFuncStorageRemove;
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
                clear: () => {
                    localStorage.clear();
                },
                remove: (key: string) => {
                    localStorage.removeItem(key);
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

    clear(): void {
        const appExecuted = this.get(EnumAppConstant.STORAGE_APP_EXECUTED);

        this.storageAgent.clear();

        if (appExecuted != null) {
            this.save(EnumAppConstant.STORAGE_APP_EXECUTED, appExecuted);
        }
    }

    remove(key: string): void {
        this.storageAgent.remove(key);
    }
}
