import { Injectable } from '@angular/core';
import {
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable, of, throwError, TimeoutError } from 'rxjs';
import { map, catchError, timeout, tap } from 'rxjs/operators';
import { UbiAuthService } from "../services/ubi-auth.service";
import { UbiError } from '../errors/UbiError';
import { EnumAppError } from '../enums/enum-app-error.enum';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { UbiAppPlatformService } from '../../../app/services/ubi-app-platform.service';

@Injectable()
export class UbiTokenInterceptor implements HttpInterceptor {

    appVersion: string = 'N/A';

    constructor(
        private authService: UbiAuthService,
        private ubibotCommonConfig: UbibotCommonConfigService,
        private ubiPlatform: UbiAppPlatformService,
    ) {
        this.ubiPlatform.getAppVersion().subscribe((v) => {
            this.appVersion = v;
        });
    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.authService.token()}`
            },
            setParams: {
                token_id: `${this.authService.token()}`,
                __portal: 'app', // add a portal flag to let server identify it
                __portal_ver: `${this.appVersion}`,
            }
        });

        // const isTestUrl = false;
        // const isTestUrl = request.url.indexOf('groups/channels/update_group') != -1; //  仅用于触发要测试的url timeout

        return next.handle(request)
            .pipe(
                // tap(() => console.log(request)),
                // timeout(10), // make error for debug
                // timeout(isTestUrl ? 500 : this.ubibotCommonConfig.ServerAccessTimeout),
                timeout(this.ubibotCommonConfig.ServerAccessTimeout), // tag: 上次为什么删了，怪，不能删
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse && ~~(event.status / 100) > 3) {
                        // console.info('HttpResponse::event =', event, ';');
                    }// else console.info('event =', event, ';');
                    return event;
                }),
                // tap(() => {
                //     alert(JSON.stringify(request));
                // }),
                catchError((err: any, caught) => {
                    if (err instanceof HttpErrorResponse) {
                        // HttpErrorResponse的格式为{ "error": ..., "headers": ..., ... }
                        if (err.status === 401
                            && (<any>err).error
                            && (<any>err).error.errorCode == 'permission_denied_force_log_off'
                        ) {
                            this.authService.logout();
                            return throwError(new UbiError(EnumAppError.SERVER_FORCED_LOGOUT));
                        } /*else if (err.status === 429) {
                            // status: 429, statusText: "Too Many Requests"
                            setTimeout(() => {
                                window.alert(`Server: code=${err.status}, msg=${err.statusText} \nPlease try again later.`);
                            });
                            return throwError(new UbiError(EnumAppError.SERVER_ERROR_429));
                        }*/
                    }

                    if (err instanceof TimeoutError) {
                        return throwError(new UbiError(EnumAppError.SERVER_ACCESS_TIMEOUT));
                    }

                    return throwError(err);
                })
            );
    }

}
