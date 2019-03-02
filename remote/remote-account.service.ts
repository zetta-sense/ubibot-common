import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';

@Injectable()
export class RemoteAccountService {

    constructor(private http: HttpClient,
                private ubibotCommonConfig: UbibotCommonConfigService) {
    }

    loginEncrypted(username: string, passwordSha256: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', passwordSha256);
        params = params.set('password_type', 'sha256');

        return this.http.post(url, params).toPromise();
    }

    login(username: string, password: string): Promise<any> {

        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/login`;

        let params = new HttpParams();
        params = params.set('username', username);
        params = params.set('password', password);

        return this.http.post(url, params).toPromise();
    }

    loginAsAdmin() {

    }

    me(): Promise<any> {
        let url = `${this.ubibotCommonConfig.EndPoint}/accounts/view`;
        return this.http.get(url).toPromise();
    }
}