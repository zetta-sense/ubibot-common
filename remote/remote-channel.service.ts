import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';

@Injectable()
export class RemoteChannelService {

    constructor(private http: HttpClient,
                private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    list(): Promise<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/channels`;
        return this.http.get(url).toPromise();
    }

}
