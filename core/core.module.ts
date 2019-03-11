import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UbiMeAvatarComponent } from './components/ubi-me-avatar/ubi-me-avatar.component';
import { ResourceUrlPipe } from './pipes/resource-url.pipe';
import { UbiUserDisplayPipe } from './pipes/ubi-user-display.pipe';
import { UbiDataChartComponent } from './components/ubi-data-chart/ubi-data-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
    declarations: [
        UbiUserDisplayPipe, // 必须，否则会抛出module not determined错误
        ResourceUrlPipe,
        UbiMeAvatarComponent,
        UbiDataChartComponent,
    ],
    exports: [
        UbiMeAvatarComponent,
        UbiDataChartComponent,
        UbiUserDisplayPipe,
        ResourceUrlPipe,
    ],
    providers: [ // 用于DI
        UbiUserDisplayPipe,
        ResourceUrlPipe,
    ],
    imports: [
        CommonModule,
        HighchartsChartModule,
    ]
})
export class UbiCoreModule { }
