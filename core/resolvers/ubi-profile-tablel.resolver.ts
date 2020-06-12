import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { delay, map, catchError } from "rxjs/operators";
import { UbiUtilsService } from "../../services/ubi-utils.service";
import { UbiError } from "../../errors/UbiError";
import { EnumAppError } from "../../enums/enum-app-error.enum";
import { UbiProfileTable } from "../../entities/ubi-profile-table.entity";
import { RemoteMiscInfoService } from "../../remote/remote-misc-info.service";

@Injectable()
export class UbiProfileTableResolver implements Resolve<UbiProfileTable> {
    constructor(
        private http: HttpClient,
        private router: Router,
        private ubiUtils: UbiUtilsService,
        private remoteMiscInfo: RemoteMiscInfoService,
    ) {

    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiProfileTable> {
        const channelId = route.paramMap.get('channelId');
        return this.remoteMiscInfo.getUbibotProfiles().pipe(
            catchError((err) => {
                let retErr;
                // console.log(err);

                // 仅当500时交由统一解析，一般情况下是维护
                if (err && err.name === 'HttpErrorResponse' && err.status === 500) {
                    const errMsg = this.ubiUtils.parseError(err);
                    retErr = err;
                    this.ubiUtils.error(errMsg);
                } else {
                    retErr = new UbiError(EnumAppError.PRODUCT_PROFILES_NOT_RESOLVED);
                    this.ubiUtils.error(retErr);
                }
                // this.ubiUtils.error('A fatal error occured. Channel could not be resolved.');
                // return throwError(err);
                return throwError(retErr);
            }),
        );//.pipe(delay(5000))
    }


}
