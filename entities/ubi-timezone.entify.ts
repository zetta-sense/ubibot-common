import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { Observable, of } from 'rxjs';
import { UbiError } from '../errors/UbiError';
import { EnumAppError } from '../enums/enum-app-error.enum';

export interface UbiTimezoneMap {
    [key: string]: string;
}

/**
 * 必须在ready后再使用，所以必须通过resolver来获得
 *
 * @class UbiTimezoneManager
 */
export class UbiTimezone {

    private remoteCache: UbiTimezoneMap;

    private preferredTimezone: string;

    constructor(
        availableTimezoneMap: UbiTimezoneMap,
    ) {
        if (availableTimezoneMap) {
            this.remoteCache = Object.assign({}, availableTimezoneMap);
        } else {
            console.warn('UbiTimezone init warning no availableTimezoneMap set. Fallback an empty map.');

            this.remoteCache = {};
        }
    }

    setPreferredTimezone(timezone: string) {
        if (this.isTimezoneSupported(timezone)) {
            this.preferredTimezone = timezone;
        } else {
            throw new UbiError(EnumAppError.TIMEZONE_NOT_SUPPORTED, { timezone: timezone });
        }
    }


    /**
     * Set undefined
     *
     * @memberof UbiTimezone
     */
    clearDefaultTimezone() {
        this.preferredTimezone = undefined;
    }


    /**
     * Check timezone string supported by server.
     *
     * @param {string} timezone
     * @returns {boolean}
     * @memberof UbiTimezone
     */
    isTimezoneSupported(timezone: string): boolean {
        const found = this.remoteCache[timezone];
        return !!found;
    }


    /**
     * 返回timezone，
     *
     * @param {boolean} useLocal
     * @returns {string}
     * @memberof UbiTimezone
     */
    getTimezone(): string {
        let timezone = this.preferredTimezone;

        // 能够set到preferredTimezone就代表是有效的
        return timezone;
    }
}
