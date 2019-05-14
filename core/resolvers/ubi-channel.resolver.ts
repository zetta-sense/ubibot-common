import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable, of, throwError } from "rxjs";
import { delay, map, catchError } from "rxjs/operators";
import { UbiChannelDAO, UbiChannel } from "../../entities/ubi-channel.entity";
import { RemoteChannelService } from "../../remote/remote-channel.service";
import { UbiUtilsService } from "../../services/ubi-utils.service";

@Injectable()
export class UbiChannelResolver implements Resolve<UbiChannelDAO> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiChannelDAO> {
        const channelId = route.paramMap.get('channelId');
        return this.remoteChannel.get(channelId).pipe(
            map((channel: UbiChannel) => new UbiChannelDAO(channel)),
            catchError((err) => {
                this.ubiUtils.hideLoading();
                this.ubiUtils.alert('A fatal error occured. Channel could not be resolved.');
                return throwError(err);
            }),
        );//.pipe(delay(5000))
    }


    constructor(
        private http: HttpClient,
        private router: Router,
        private ubiUtils: UbiUtilsService,
        private remoteChannel: RemoteChannelService,
    ) {

    }

}
