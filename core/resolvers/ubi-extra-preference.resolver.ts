import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable } from "rxjs";
import { delay, timeout } from "rxjs/operators";

// @deprecated
// 目前由于io会产生延迟，直接放到app.component.ts得navigate流程
@Injectable()
export class UbiExtraPreferenceResolver implements Resolve<UbiExtraPreference> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiExtraPreference> {
        return this.remoteAccount.getExtraPref().pipe(
            // delay(5 * 1000),
        );//.pipe(delay(5000))   .pipe(timeout(1))
    }


    constructor(
        private http: HttpClient,
        private remoteAccount: RemoteAccountService,
    ) {

    }

}
