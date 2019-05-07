import {Injectable} from '@angular/core';
import {
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import {Observable, of, throwError, TimeoutError} from 'rxjs';
import {map, catchError, timeout} from 'rxjs/operators';
import {UbiAuthService} from "../services/ubi-auth.service";
import {UbiError} from '../errors/UbiError';
import {EnumAppError} from '../enums/enum-app-error.enum';
import {UbibotCommonConfigService} from '../providers/ubibot-common-config.service';

@Injectable()
export class UbiTokenInterceptor implements HttpInterceptor {

    constructor(private authService: UbiAuthService,
                private ubibotCommonConfig: UbibotCommonConfigService) {
    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = request.clone({
            setHeaders: {
                Authorization: `Bearer ${this.authService.token()}`
            },
            setParams: {
                token_id: `${this.authService.token()}`
            }
        });

        return next.handle(request)
            .pipe(
                // timeout(10), // make error for debug
                timeout(this.ubibotCommonConfig.ServerAccessTimout),
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse && ~~(event.status / 100) > 3) {
                        // console.info('HttpResponse::event =', event, ';');
                    }// else console.info('event =', event, ';');
                    return event;
                }),
                catchError((err: any, caught) => {
                    if (err instanceof HttpErrorResponse) {
                        // HttpErrorResponse的格式为{ "error": ..., "headers": ..., ... }
                        if (err.status === 401
                            && (<any>err).error
                            && (<any>err).error.errorCode == 'permission_denied_force_log_off') {

                            this.authService.logout();
                            return throwError(new UbiError(EnumAppError.SERVER_FORCED_LOGOUT));
                        }
                    }

                    if(err instanceof TimeoutError) {
                        return throwError(new UbiError(EnumAppError.SERVER_ACCESS_TIMEOUT));
                    }

                    return throwError(err);
                })
            );
    }

}
