import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UbiLocalizeService} from './services/ubi-localize.service';
import {HttpClientModule, HttpClient} from '@angular/common/http';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {AppConfigService} from './providers/app-config.service';
import {UbiUserDisplayPipe} from './pipes/ubi-user-display.pipe';

let i18nPath;

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, i18nPath, '.json');
}

@NgModule({
    declarations: [
    ],
    entryComponents: [
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (HttpLoaderFactory),
                deps: [HttpClient]
            }
        })
    ],
    exports: [
    ],
    providers: [
        AppConfigService,
        UbiLocalizeService,
        // secondary
        UbiUserDisplayPipe,
        // init dep
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                return () => {
                    console.log('UbiBot common libs init...');
                };
            },
            // 启动时初始化一些必须的服务
            // ref: https://angular.io/guide/dependency-injection-providers
            deps: [
                AppConfigService,
                UbiLocalizeService,
            ],
            multi: true
        }
    ],
    bootstrap: []
})
export class UbibotCommonModule {
    static forRoot(opts: any = {}): ModuleWithProviders {
        i18nPath = opts.i18nPath || './assets/i18n/';

        return {
            ngModule: UbibotCommonModule,
            providers: [
            ]
        };
    }
}
