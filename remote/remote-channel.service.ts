import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RemoteChannelService {

    constructor(private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    list(): Observable<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/channels`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.channels)
        );//.subscribe(resp => resp)
    }

}
