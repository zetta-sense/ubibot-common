import { APP_INITIALIZER, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UbiLocalizeService } from './services/ubi-localize.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { TranslateModule, TranslateLoader, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { UbibotCommonConfigService } from './providers/ubibot-common-config.service';

// ref: https://github.com/highcharts/highcharts-angular
import { RemoteAccountService } from './remote/remote-account.service';
import { UbiAuthService, UBIBOT_AUTH_CONFIGURATION } from './services/ubi-auth.service';
import { UbiAuthGuard } from './guards/ubi-auth.guard';
import { RemoteChannelService } from './remote/remote-channel.service';
import { UbiEventService } from './services/ubi-event.service';
import { UbiCoreModule } from './core/core.module';
import { UbiConsoleService } from './services/ubi-console.service';

export const UBIBOT_COMMON_CONFIGURATION = new InjectionToken<any>('UBIBOT_COMMON_CONFIGURATION');

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient, opts: any) {
    return new TranslateHttpLoader(http, opts.i18nPath || './assets/i18n/', '.json');
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
                deps: [HttpClient, UBIBOT_COMMON_CONFIGURATION]
            }
        }),
        UbiCoreModule
    ],
    exports: [
        TranslateModule, // see https://github.com/ngx-translate/core#sharedmodule
    ],
    providers: [
        UbibotCommonConfigService,
        // secondary
        UbiAuthService,
        UbiAuthGuard,
        UbiEventService,
        RemoteAccountService,
        RemoteChannelService,
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
                UbiLocalizeService,
                UbiConsoleService,
            ],
            multi: true
        }
    ],
    bootstrap: []
})
export class UbibotCommonModule {
    // opts: {i18nPath: './assets/i18n/', authPage: '/auth'}
    static forRoot(opts: any = {}): ModuleWithProviders {
        return {
            ngModule: UbibotCommonModule,
            // tag: 必须要这样传参，return前不能有任何动态处理，具体参考:
            // https://github.com/angular/angular/issues/14707
            // https://github.com/angular/angular/blob/4.3.3/packages/router/src/router_module.ts#L150
            providers: [
                { provide: UBIBOT_COMMON_CONFIGURATION, useValue: opts || {} },

                // @deprecated
                { provide: UBIBOT_AUTH_CONFIGURATION, useValue: {} },
            ]
        };
    }
}
