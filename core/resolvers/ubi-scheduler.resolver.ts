import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable, throwError, of } from "rxjs";
import { delay, map, catchError, switchMap } from "rxjs/operators";
import { RemoteChannelService } from "../../remote/remote-channel.service";
import { UbiRule } from "../../entities/ubi-rule.entity";
import { UbiUtilsService } from "../../services/ubi-utils.service";
import { UbiError } from "../../errors/UbiError";
import { UbiScheduler } from "../../entities/ubi-scheduler.entity";
import { RemoteSchedulerService } from "../../remote/remote-scheduler.service";
import { EnumAppError } from "../../enums/enum-app-error.enum";

@Injectable()
export class UbiSchedulerResolver implements Resolve<UbiScheduler> {

    constructor(
        private http: HttpClient,
        private router: Router,
        private ubiUtils: UbiUtilsService,
        private remoteChannel: RemoteChannelService,
        private remoteScheduler: RemoteSchedulerService,
    ) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiScheduler> {
        const channelId = route.parent.paramMap.get('channelId');
        const schedulerId = route.paramMap.get('schedulerId');

        // console.log(route, channelId, schedulerId);

        return this.remoteScheduler.list(channelId).pipe(
            switchMap((schedulers: UbiScheduler[]) => {
                let filtered = schedulers.filter(x => x.s_id == schedulerId);
                return filtered.length ? of(filtered[0]) : throwError(EnumAppError.SCHEDULER_NOT_RESOLVED);
            }),
            catchError((err) => {
                let retErr;
                // console.log(err);

                // 仅当500时交由统一解析，一般情况下是维护
                if (err && err.name === 'HttpErrorResponse' && err.status === 500) {
                    const errMsg = this.ubiUtils.parseError(err);
                    retErr = err;
                    this.ubiUtils.error(errMsg);
                } else {
                    retErr = new UbiError(EnumAppError.SCHEDULER_NOT_RESOLVED);
                    this.ubiUtils.error(retErr);
                }
                return throwError(retErr);
            }),
        );//.pipe(delay(5000))
    }
}
