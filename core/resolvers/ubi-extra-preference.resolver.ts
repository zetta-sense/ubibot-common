import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable } from "rxjs";
import { delay } from "rxjs/operators";

@Injectable()
export class UbiExtraPreferenceResolver implements Resolve<UbiExtraPreference> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiExtraPreference> {
        return this.remoteAccount.getExtraPref();//.pipe(delay(5000))
    }


    constructor(private http: HttpClient,
        private remoteAccount: RemoteAccountService
    ) {

    }

}
