import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable } from "@angular/core";
import { UbiExtraPreference } from "../../entities/ubi-extra-preference.entity";
import { HttpClient } from "@angular/common/http";
import { RemoteAccountService } from "../../remote/remote-account.service";
import { Observable, throwError } from "rxjs";
import { delay, map, catchError } from "rxjs/operators";
import { RemoteChannelService } from "../../remote/remote-channel.service";
import { UbiUtilsService } from "../../services/ubi-utils.service";
import { UbiGroup } from "../../entities/ubi-group.entity";
import { RemoteGroupService } from "../../remote/remote-group.service";
import * as _ from 'lodash';

@Injectable()
export class UbiGroupResolver implements Resolve<UbiGroup> {

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UbiGroup> {
        const groupId = route.paramMap.get('groupId');

        return this.remoteGroup.list().pipe(
            map((groups: UbiGroup[]) => {
                return _.find(groups, { group_id: groupId });
            }),
            catchError((err) => {
                this.ubiUtils.error('A fatal error occured. Group could not be resolved.');
                return throwError(err);
            }),
        );//.pipe(delay(5000))
    }


    constructor(
        private http: HttpClient,
        private router: Router,
        private ubiUtils: UbiUtilsService,
        private remoteGroup: RemoteGroupService,
    ) {

    }

}
