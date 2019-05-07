import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';

export interface UbiAttachDeviceResult {
    channel: {
        channel_id: string,
        metadata: string,
        name: string,
        write_key: string,
    };

    device: {
        attached_at: string,
        channel_id: string,
        product_id: string,
        serial: string,
    };
}

@Injectable()
export class RemoteProductService {

    constructor(
        private http: HttpClient,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }


    attachDeviceByPidAndSerial(productId: string, serial: string): Observable<UbiAttachDeviceResult> {
        if (!productId) throw new UbiError('Product ID is required for this API!');
        if (!serial) throw new UbiError('Serial is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/products/${productId}/devices/${serial}/attach`;
        return this.http.post(url, null).pipe(
            map((resp: any) => resp)
        );
    }

}
