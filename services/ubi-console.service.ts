import {Injectable, OnDestroy} from '@angular/core';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class UbiConsoleService implements OnDestroy {
    constructor() {
        (<any>window).UbiConsole = this;
    }

    storage(key: string) {
        return localStorage.getItem(key);
    }

    ngOnDestroy(): void {

    }
}
