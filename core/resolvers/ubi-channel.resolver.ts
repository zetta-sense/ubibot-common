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
import { UbiError } from "../../errors/UbiError";
import { EnumAppError } from "../../enums/enum-app-error.enum";

@Injectable()
export class UbiChannelResolver implements Resolve<UbiChannelDAO> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiChannelDAO> {
        const channelId = route.paramMap.get('channelId');
        return this.remoteChannel.get(channelId).pipe(
            map((channel: UbiChannel) => new UbiChannelDAO(channel)),
            catchError((err) => {
                let retErr;
                // console.log(err);

                // 仅当500时交由统一解析，一般情况下是维护
                if (err && err.name === 'HttpErrorResponse' && err.status === 500) {
                    const errMsg = this.ubiUtils.parseError(err);
                    retErr = err;
                    this.ubiUtils.error(errMsg);
                } else {
                    retErr = new UbiError(EnumAppError.CHANNEL_NOT_RESOLVED);
                    this.ubiUtils.error(retErr);
                }
                // this.ubiUtils.error('A fatal error occured. Channel could not be resolved.');
                // return throwError(err);
                return throwError(retErr);
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
