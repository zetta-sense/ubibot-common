import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference, UbiExtraPreferenceTimezoneSource } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable, of } from "rxjs";
import { delay, timeout, switchMap } from "rxjs/operators";
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import { UbiTimezone } from "../../entities/ubi-timezone.entify";
import { UbiAuthService } from "../../services/ubi-auth.service";
import { UbiUserPreferenceService } from "../../../../app/services/ubi-user-preference.service";
import { RemoteMiscInfoService } from "../../remote/remote-misc-info.service";

let singleton: UbiTimezone;

/**
 * 为什么不使用service?
 * 因为必须保证在调用页面前能够顺利初始化完成，它需要访问api进行初始化
 *
 * @export
 * @class UbiTimezoneResolver
 * @implements {Resolve<UbiTimezone>}
 */
@Injectable()
export class UbiTimezoneResolver implements Resolve<UbiTimezone> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiTimezone> {
        return of(null).pipe(
            switchMap(() => {
                if (!singleton) { // 初始化
                    // fetch remote timezone to init
                    return this.remoteMisc.getTimezones().pipe(
                        switchMap((timezoneMap) => {
                            singleton = new UbiTimezone(timezoneMap);
                            return of(singleton);
                        }),
                    );
                } else {
                    return of(singleton);
                }
            }),
            switchMap((timezone: UbiTimezone) => {
                // 需要每次调用resolve的时候重新set一次default，因为用户可能切换账号
                if (this.ubiAuth.isLoggedIn()) {
                    // tag: 根据用户偏好选择account timezone还是local timezone
                    let useLocal = this.ubiUserPref.getPreferredTimezoneSource() === UbiExtraPreferenceTimezoneSource.Local;

                    let localTimezone; // 这里不用var方便comment掉debug，var本身没问题
                    try {
                        localTimezone = moment.tz.guess();
                    } catch (e) { }

                    if (useLocal && singleton.isTimezoneSupported(localTimezone)) {
                        singleton.setPreferredTimezone(localTimezone);
                        // singleton.setPreferredTimezone('America/Guyana'); // -4

                        console.log(`Using local timezone(${localTimezone}).`);
                    } else {
                        // 因为以后需要将timezone显示到charts，所以还是填上
                        const timezone = this.ubiAuth.me().account.timezone;
                        console.log(`Using account timezone(${timezone}).`); // setPreferredTimezone可能会抛2009，例如America/Toronto

                        singleton.setPreferredTimezone(timezone); // 根据account的timezone作为default
                    }

                    // timezone.clearDefaultTimezone(); // 如果跟的是account，理论上不用设置timezone

                } else {
                    // 用户未login
                    timezone.clearDefaultTimezone();
                }

                return of(timezone);
            }),
        );
    }


    constructor(
        private http: HttpClient,
        private ubiAuth: UbiAuthService,
        private ubiUserPref: UbiUserPreferenceService,
        private remoteMisc: RemoteMiscInfoService,
        private remoteAccount: RemoteAccountService,
    ) {
    }

}
