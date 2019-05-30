import { Injectable, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { UbiStorageService } from './ubi-storage.service';

@Injectable({
    providedIn: 'root'
})
export class UbiConsoleService implements OnDestroy {
    constructor(
        private ubiStorage: UbiStorageService,
    ) {
        (<any>window).UbiConsole = this;
    }

    storage(key: string) {
        return this.ubiStorage.get(key);
    }

    ngOnDestroy(): void {

    }
}
