import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UbiAPNListItem {
    label: string;
    params: {
        apn: string;
        user: string;
        pwd: string;
    }
}

@Injectable()
export class RemoteMiscInfoService {

    constructor(private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService) {
    }


    /**
     * Fetch apn item list.
     *
     * @returns {Observable<UbiAPNListItem[]>}
     * @memberof RemoteMiscInfoService
     */
    getAPNList(): Observable<UbiAPNListItem[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/get_mobile_apn_list`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return resp.apn_list;
            })
        );
    }
}
