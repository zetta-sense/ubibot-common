import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable, throwError } from "rxjs";
import { delay, map, catchError } from "rxjs/operators";
import { RemoteChannelService } from "../../remote/remote-channel.service";
import { UbiRule } from "../../entities/ubi-rule.entity";
import { UbiUtilsService } from "../../services/ubi-utils.service";
import { UbiError } from "../../errors/UbiError";
import { EnumAppError } from "../../enums/enum-app-error.enum";

@Injectable()
export class UbiRuleResolver implements Resolve<UbiRule> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiRule> {
        const channelId = route.paramMap.get('channelId');
        const ruleId = route.paramMap.get('ruleId');

        return this.remoteChannel.getRule(channelId, ruleId).pipe(
            map((rule: UbiRule) => rule),
            catchError((err) => {
                let retErr;
                // console.log(err);

                // 仅当500时交由统一解析，一般情况下是维护
                if (err && err.name === 'HttpErrorResponse' && err.status === 500) {
                    const errMsg = this.ubiUtils.parseError(err);
                    retErr = err;
                    this.ubiUtils.error(errMsg);
                } else {
                    retErr = new UbiError(EnumAppError.RULE_NOT_RESOLVED);
                    this.ubiUtils.error(retErr);
                }
                return throwError(retErr);
            }),
        );//.pipe(delay(5000))
    }


    constructor(
        private http: HttpClient,
        private router: Router,
        private ubiUtils: UbiUtilsService,
        private remoteChannel: RemoteChannelService
    ) {

    }

}
