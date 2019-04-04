import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable } from "rxjs";
import { delay, map } from "rxjs/operators";
import { UbiChannelDAO, UbiChannel } from "../../entities/ubi-channel.entity";
import { RemoteChannelService } from "../../remote/remote-channel.service";

@Injectable()
export class UbiChannelResolver implements Resolve<UbiChannelDAO> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiChannelDAO> {
        const channelId = route.paramMap.get('channelId');
        return this.remoteChannel.get(channelId).pipe(
            map((channel: UbiChannel) => new UbiChannelDAO(channel))
        );//.pipe(delay(5000))
    }


    constructor(private http: HttpClient,
        private remoteChannel: RemoteChannelService
    ) {

    }

}
