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
        UbiDataChartComponent,
        UbiProductAvatarComponent,
        UbiChannelAvatarComponent,
        UbiLazyImgDirective,
        UbiChannelDaosFilterPipe,
        BytesPipe,
        UbiVarDirective,
        UbiFieldValueDirective,
    ],
    exports: [
        UbiMeAvatarComponent,
        UbiDataChartComponent,
        UbiProductAvatarComponent,
        UbiChannelAvatarComponent,
        UbiUserDisplayPipe,
        ResourceUrlPipe,
        UbiChannelDaosFilterPipe,
        BytesPipe,
        UbiVarDirective,
        UbiLazyImgDirective,
        UbiFieldValueDirective,
    ],
    providers: [ // 用于DI
        UbiUserDisplayPipe,
        ResourceUrlPipe,
        UbiSyncService,
        UbiSyncV2Service,
        UbiExtraPreferenceResolver,
        UbiChannelDaosFilterPipe,
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
