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

@Injectable()
export class UbiRuleResolver implements Resolve<UbiRule> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiRule> {
        const channelId = route.paramMap.get('channelId');
        const ruleId = route.paramMap.get('ruleId');

        return this.remoteChannel.getRule(channelId, ruleId).pipe(
            map((rule: UbiRule) => rule),
            catchError((err) => {
                this.ubiUtils.hideLoading();
                this.ubiUtils.alert('A fatal error occured. Rule could not be resolved.');
                return throwError(err);
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
