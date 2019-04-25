import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable } from "rxjs";
import { delay, map } from "rxjs/operators";
import { RemoteChannelService } from "../../remote/remote-channel.service";
import { UbiRule } from "../../entities/ubi-rule.entity";

@Injectable()
export class UbiRuleResolver implements Resolve<UbiRule> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiRule> {
        const channelId = route.paramMap.get('channelId');
        const ruleId = route.paramMap.get('ruleId');

        return this.remoteChannel.getRule(channelId, ruleId).pipe(
            map((rule: UbiRule) => rule)
        );//.pipe(delay(5000))
    }


    constructor(private http: HttpClient,
        private remoteChannel: RemoteChannelService
    ) {

    }

}
