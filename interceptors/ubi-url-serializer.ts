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
import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';


/**
 * ref: https://stackoverflow.com/questions/45428842/angular-url-plus-sign-converting-to-space
 *
 * @export
 * @class UbiUrlSerializer
 * @implements {UrlSerializer}
 */
export class UbiUrlSerializer implements UrlSerializer {
    private _defaultUrlSerializer: DefaultUrlSerializer = new DefaultUrlSerializer();

    parse(url: string): UrlTree {
        console.log(1122);
        // Encode "+" to "%2B"
        url = url.replace(/\+/gi, '%2B');
        // Use the default serializer.
        return this._defaultUrlSerializer.parse(url);
    }

    serialize(tree: UrlTree): string {
        console.log(3344);
        return this._defaultUrlSerializer.serialize(tree).replace(/\+/gi, '%2B');
    }
}
