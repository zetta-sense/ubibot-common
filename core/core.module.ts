import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbiMeAvatarComponent } from './components/ubi-me-avatar/ubi-me-avatar.component';
import { ResourceUrlPipe } from './pipes/resource-url.pipe';
import { UbiUserDisplayPipe } from './pipes/ubi-user-display.pipe';
import { UbiDataChartComponent } from './components/ubi-data-chart/ubi-data-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { UbiProductAvatarComponent } from './components/ubi-product-avatar/ubi-product-avatar.component';
import { UbiChannelAvatarComponent } from './components/ubi-channel-avatar/ubi-channel-avatar.component';
import { UbiLazyImgDirective } from './directives/ubi-lazy-img.directive';
import { UbiSyncService } from './service/ubi-sync.service';
import { UbiExtraPreferenceResolver } from './resolvers/ubi-extra-preference.resolver';
import { UbiChannelDaosFilterPipe } from './pipes/ubi-channel-daos-filter.pipe';
import { BytesPipe } from './pipes/bytes.pipe';
import { UbiVarDirective } from './directives/ubi-var.directive';
import { UbiFieldValueDirective } from './directives/ubi-field-value.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UbiSyncV2Service } from './service/ubi-sync-v2.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UbiIpv4InputComponent } from './components/ubi-ipv4-input/ubi-ipv4-input.component';
import { UbiUserAvatarComponent } from './components/ubi-user-avatar/ubi-user-avatar.component';
import { NoopPipe } from './pipes/noop.pipe';
import { EmptyPipe } from './pipes/noop.pipe copy';
import { UbiTimezoneResolver } from './resolvers/ubi-timezone.resolver';

/**
 * Core module of common module.
 * 这个模块作为Shared Module使用
 *
 * @export
 * @class UbiCoreModule
 */
@NgModule({
    declarations: [
        UbiUserDisplayPipe, // 必须，否则会抛出module not determined错误
        ResourceUrlPipe,
        UbiMeAvatarComponent,
        UbiUserAvatarComponent,
        UbiDataChartComponent,
        UbiProductAvatarComponent,
        UbiChannelAvatarComponent,
        UbiLazyImgDirective,
        UbiChannelDaosFilterPipe,
        BytesPipe,
        NoopPipe,
        EmptyPipe,
        UbiVarDirective,
        UbiFieldValueDirective,
        UbiIpv4InputComponent,
    ],
    exports: [
        UbiMeAvatarComponent,
        UbiUserAvatarComponent,
        UbiDataChartComponent,
        UbiProductAvatarComponent,
        UbiChannelAvatarComponent,
        UbiUserDisplayPipe,
        ResourceUrlPipe,
        UbiChannelDaosFilterPipe,
        BytesPipe,
        NoopPipe,
        EmptyPipe,
        UbiVarDirective,
        UbiLazyImgDirective,
        UbiFieldValueDirective,
        UbiIpv4InputComponent,
    ],
    providers: [ // 用于DI
        // pipes
        UbiUserDisplayPipe,
        ResourceUrlPipe,
        UbiSyncService,
        UbiSyncV2Service,,
        UbiChannelDaosFilterPipe,
        // resolvers
        UbiExtraPreferenceResolver,
        UbiTimezoneResolver,
        // 一些resolver是根据path的，所以不摆进来
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HighchartsChartModule,
        FontAwesomeModule,
    ]
})
export class UbiCoreModule { }
